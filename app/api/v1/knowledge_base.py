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

    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Check if company already has a KB of this type
        existing_kb = await supabase_service.check_existing_kb(
            user_id=current_user.id,
            company_name=company_name,
            kb_type=kb_type
        )

        if existing_kb and existing_kb.get('count', 0) > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Company '{company_name}' already has a {kb_type} knowledge base. Only one {kb_type} KB per company is allowed."
            )

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
