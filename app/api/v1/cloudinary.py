from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.services.cloudinary import cloudinary_service

router = APIRouter(prefix="/api/v1/cloudinary", tags=["cloudinary"])


@router.post("/upload")
async def upload_media(
    files: List[UploadFile] = File(...),
    kb_type: str = Form(...),  # "Product" or "Service"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload multiple media files (images/videos) to Cloudinary.
    Files are stored in user-specific folders: users/{user_id}/product or users/{user_id}/service
    """
    if not cloudinary_service.is_configured():
        raise HTTPException(
            status_code=500,
            detail="Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env"
        )

    # Validate KB type
    if kb_type not in ["Product", "Service"]:
        raise HTTPException(status_code=400, detail="kb_type must be 'Product' or 'Service'")

    # Validate files
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    try:
        # Prepare files for upload
        files_data = []
        for file in files:
            content = await file.read()
            files_data.append({
                "filename": file.filename,
                "content": content
            })

        # Upload files
        result = await cloudinary_service.upload_multiple_files(
            files=files_data,
            user_id=current_user.id,
            kb_type=kb_type
        )

        return {
            "success": result["success"],
            "message": f"Uploaded {result['uploaded']} files, {result['failed']} failed",
            "uploaded": result["uploaded"],
            "failed": result["failed"],
            "results": result["results"],
            "errors": result["errors"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload files: {str(e)}")


@router.get("/media")
async def get_user_media(
    kb_type: Optional[str] = None,
    max_results: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of media files for the current user.
    Optionally filter by kb_type (Product or Service).
    """
    if not cloudinary_service.is_configured():
        raise HTTPException(status_code=500, detail="Cloudinary is not configured")

    # Validate KB type if provided
    if kb_type and kb_type not in ["Product", "Service"]:
        raise HTTPException(status_code=400, detail="kb_type must be 'Product' or 'Service'")

    try:
        result = await cloudinary_service.get_user_media(
            user_id=current_user.id,
            kb_type=kb_type,
            max_results=max_results
        )

        return {
            "success": True,
            "total": result["total"],
            "kb_type": kb_type,
            "resources": result["resources"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve media: {str(e)}")


@router.delete("/media/{public_id:path}")
async def delete_media(
    public_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a media file from Cloudinary.
    The public_id should include the full path (e.g., users/123/product/image_abc123)
    """
    if not cloudinary_service.is_configured():
        raise HTTPException(status_code=500, detail="Cloudinary is not configured")

    # Verify the public_id belongs to the current user
    user_folder_prefix = f"users/{current_user.id}/"
    if not public_id.startswith(user_folder_prefix):
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own files"
        )

    try:
        result = await cloudinary_service.delete_file(public_id)

        return {
            "success": True,
            "message": "File deleted successfully",
            "public_id": public_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
