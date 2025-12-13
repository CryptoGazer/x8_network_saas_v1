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
        raise HTTPException(500, "Cloudinary is not configured")

    if not files:
        raise HTTPException(400, "No files provided")

    # Проверяем типы в запросе
    video_files = [f for f in files if f.content_type.startswith("video/")]
    image_files = [f for f in files if f.content_type.startswith("image/")]

    if video_files and image_files:
        raise HTTPException(400, "Cannot upload images and video in one request")

    if len(video_files) > 1:
        raise HTTPException(400, "Only one video file can be uploaded at a time")

    # Глобальное ограничение «одно видео на папку»
    if video_files:
        media = await cloudinary_service.get_user_media(
            user_id=current_user.id,
            kb_type=kb_type,
            max_results=50,
        )
        existing_videos = [
            r for r in media.get("resources", [])
            if r.get("resource_type") == "video"
        ]
        if existing_videos:
            raise HTTPException(
                400,
                "This knowledge base already has a video. "
                "Delete the existing one before uploading a new video.",
            )

    # Читаем файлы и передаём в сервис
    files_payload = []
    for f in files:
        content = await f.read()
        files_payload.append({"filename": f.filename, "content": content})

    result = await cloudinary_service.upload_multiple_files(
        files=files_payload,
        user_id=current_user.id,
        kb_type=kb_type,
    )
    return result


@router.get("/media")
async def get_user_media(
    kb_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of media files for the current user.
    Optionally filter by kb_type (Product or Service).
    """
    media = await cloudinary_service.get_user_media(
        user_id=current_user.id,
        kb_type=kb_type,
        max_results=100,
    )

    resources = media.get("resources", [])

    images = [
        {
            "public_id": r.get("public_id"),
            "url": r.get("secure_url") or r.get("url"),
            "resource_type": "image",
        }
        for r in resources
        if r.get("resource_type") == "image"
    ]

    def make_video_item(r):
        base_url = r.get("secure_url") or r.get("url") or ""
        thumb_url = base_url

        # Попробуем заменить расширение на .jpg
        # https://res.cloudinary.com/.../video/upload/.../file.mp4 -> .../file.jpg
        try:
            if "." in base_url.rsplit("/", 1)[-1]:
                path, _ext = base_url.rsplit(".", 1)
                thumb_url = f"{path}.jpg"
            else:
                thumb_url = base_url + ".jpg"
        except Exception:
            thumb_url = base_url

        return {
            "public_id": r.get("public_id"),
            "url": base_url,
            "thumbnail_url": thumb_url,
            "resource_type": "video",
        }

    videos = [
        make_video_item(r)
        for r in resources
        if r.get("resource_type") == "video"
    ]

    return {
        "success": True,
        "images": images,
        "videos": videos,
    }


@router.get("/images")
async def list_images(kb_type: str, current_user: User = Depends(get_current_user)):
    media = await cloudinary_service.get_user_media(current_user.id, kb_type)
    return [
        r.get("secure_url") or r.get("url")
        for r in media.get("resources", [])
        if r.get("resource_type") == "image"
    ]


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
