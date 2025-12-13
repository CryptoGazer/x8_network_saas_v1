import csv
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import pandas as pd
import io
from decimal import Decimal
from datetime import datetime

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.services.supabase import supabase_service
from app.services.cloudinary import cloudinary_service

from uuid import UUID
from pprint import pprint

router = APIRouter(prefix="/api/v1/knowledge-base", tags=["knowledge-base"])


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    company_name: str = Form(...),
    kb_type: str = Form(...),  # "Product" or "Service"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file for Product or Service knowledge base.
    Creates/updates a Supabase table with the data.
    """
    if not supabase_service.is_configured():
        raise HTTPException(
            status_code=500,
            detail="Supabase is not configured. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env"
        )

    # Validate KB type
    if kb_type not in ["Product", "Service"]:
        raise HTTPException(status_code=400, detail="kb_type must be 'Product' or 'Service'")

    # Validate file type - support both CSV and Excel
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel (.xlsx, .xls) files are supported")

    try:
        # Read file based on extension
        contents = await file.read()

        if file.filename.endswith('.csv'):
            # Read CSV file - try multiple encodings and delimiters
            # Try common encodings: utf-8, utf-8-sig (with BOM), latin-1, cp1252
            delimiters_to_try = [',', ';', '\t']

            df = None
            for delimiter in delimiters_to_try:
                try:
                    print("Uploaded filename:", file.filename)
                    print("File bytes len:", len(contents))
                    print(contents[:300])  # первые байты/символы
                    tmp = pd.read_csv(
                        io.BytesIO(contents),
                        encoding="utf-8",
                        sep=delimiter,
                        engine="python",
                        quotechar='"',
                        quoting=csv.QUOTE_MINIMAL,
                    )
                    print("TRY delimiter", repr(delimiter), "->", tmp.shape)
                    if tmp.shape[1] > 1:
                        df = tmp
                        print(f"✅ picked delimiter {repr(delimiter)}")
                        break
                except Exception as e:
                    print("ERROR for delimiter", repr(delimiter), ":", e)

            if df is None:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to parse CSV file. Please check the file encoding and delimiter."
                )
        else:
            # Read Excel file (both .xlsx and .xls)
            df = pd.read_excel(
                io.BytesIO(contents),
                engine='openpyxl' if file.filename.endswith('.xlsx') else None
            )

        # Clean up column names - strip whitespace and normalize
        df.columns = df.columns.str.strip()

        # Log original columns for debugging
        print(f"📋 CSV Columns detected: {list(df.columns)}")

        # Allow multiple CSV uploads - use UPSERT logic based on SKU field
        # If SKU exists: UPDATE that row with new data
        # If SKU doesn't exist: INSERT new row

        # Create table name
        table_name = supabase_service.generate_table_name(company_name, kb_type)

        # Process and upload data
        result = await supabase_service.create_kb_table(
            table_name=table_name,
            df=df,
            kb_type=kb_type,
            user_id=current_user.id,
            company_name=company_name
        )

        return {
            "success": True,
            "message": f"{kb_type} knowledge base created successfully",
            "table_name": table_name,
            "rows_imported": result.get("rows_imported", 0),
            "company_name": company_name,
            "kb_type": kb_type
        }

    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="The CSV file is empty")
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Failed to parse CSV file. Please check the format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload CSV: {str(e)}")


@router.post("/media-upload")
async def upload_kb_media(
    files: list[UploadFile] = File(...),
    kb_type: str = Form(...),          # "Product" | "Service"
    company_name: str = Form(...),     # just echoed back for convenience
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Bulk media upload for a KB. Stores files in Cloudinary in a user/kb_type folder.
    """
    if not cloudinary_service.is_configured():
        raise HTTPException(
            status_code=500,
            detail="Cloudinary is not configured. Please set CLOUDINARY_* env vars."
        )

    if kb_type not in ["Product", "Service"]:
        raise HTTPException(
            status_code=400,
            detail="kb_type must be 'Product' or 'Service'"
        )

    if not files:
        raise HTTPException(
            status_code=400,
            detail="No files uploaded"
        )

    prepared_files = []
    for f in files:
        content = await f.read()
        prepared_files.append(
            {
                "content": content,
                "filename": f.filename or "file"
            }
        )

    # CloudinaryService will decide resource_type based on file extension
    result = await cloudinary_service.upload_multiple_files(
        files=prepared_files,
        user_id=current_user.id,
        kb_type=kb_type
    )

    return {
        "success": result["success"],
        "items": result["results"],            # [{filename, url, public_id, resource_type}, ...]
        "failed": result["failed"],
        "errors": result["errors"],
        "folder": cloudinary_service.get_user_folder_path(current_user.id, kb_type),
        "kb_type": kb_type,
        "company_name": company_name
    }


@router.get("/list")
async def list_knowledge_bases(
    company_name: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all knowledge bases for the current user.
    Optionally filter by company name.
    """
    if not supabase_service.is_configured():
        raise HTTPException(status_code=500, detail="Supabase is not configured")

    try:
        kbs = await supabase_service.list_user_kbs(
            user_id=current_user.id,
            company_name=company_name
        )

        return {
            "success": True,
            "knowledge_bases": kbs
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve knowledge bases: {str(e)}")


@router.get("/data/{table_name}")
async def get_kb_data(
    table_name: str,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get data from a specific knowledge base table.
    """
    if not supabase_service.is_configured():
        raise HTTPException(status_code=500, detail="Supabase is not configured")
    try:
        data = await supabase_service.get_kb_data(
            table_name=table_name,
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )

        return {
            "success": True,
            "table_name": table_name,
            "data": data.get("rows", []),
            "total_count": data.get("total_count", 0),
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve data: {str(e)}")


@router.delete("/delete/{table_name}")
async def delete_kb(
    table_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a knowledge base table.
    """
    if not supabase_service.is_configured():
        raise HTTPException(status_code=500, detail="Supabase is not configured")

    try:
        result = await supabase_service.delete_kb_table(
            table_name=table_name,
            user_id=current_user.id
        )

        return {
            "success": True,
            "message": f"Knowledge base '{table_name}' deleted successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete knowledge base: {str(e)}")


@router.post("/row/{table_name}")
async def add_row_to_kb(
    table_name: str,
    row_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new row to a knowledge base table in Supabase.
    """
    if not supabase_service.is_configured():
        raise HTTPException(status_code=500, detail="Supabase is not configured")

    try:
        result = await supabase_service.add_row(
            table_name=table_name,
            row_data=row_data,
            user_id=current_user.id
        )

        return {
            "success": True,
            "message": "Row added successfully",
            "row": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add row: {str(e)}")


@router.patch("/row/{table_name}/{row_id}")
async def update_row_in_kb(
    table_name: str,
    row_id: UUID,
    row_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a row in a knowledge base table in Supabase.
    """
    if not supabase_service.is_configured():
        raise HTTPException(status_code=500, detail="Supabase is not configured")

    try:
        result = await supabase_service.update_row(
            table_name=table_name,
            row_id=str(row_id),
            row_data=row_data,
            user_id=current_user.id
        )

        return {
            "success": True,
            "message": "Row updated successfully",
            "row": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update row: {str(e)}")


@router.delete("/row/{table_name}/{row_id}")
async def delete_row_from_kb(
    table_name: str,
    row_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a row from a knowledge base table in Supabase.
    """
    if not supabase_service.is_configured():
        raise HTTPException(status_code=500, detail="Supabase is not configured")

    try:
        result = await supabase_service.delete_row(
            table_name=table_name,
            row_id=str(row_id),
            user_id=current_user.id
        )

        return {
            "success": True,
            "message": "Row deleted successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete row: {str(e)}")
