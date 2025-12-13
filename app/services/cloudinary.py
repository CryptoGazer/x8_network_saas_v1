"""
Cloudinary service for media uploads.
Automatically creates user-specific folders and manages media assets.
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Optional, List, Dict, Any
from app.core.config import settings


class CloudinaryService:
    """Service for managing Cloudinary uploads and folders."""

    def __init__(self):
        """Initialize Cloudinary configuration."""
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True
            )
            self._configured = True
        else:
            self._configured = False

    def is_configured(self) -> bool:
        """Check if Cloudinary is properly configured."""
        return self._configured

    def get_user_folder_path(self, user_id: int, kb_type: Optional[str] = None) -> str:
        """
        Generate folder path for user's media.
        Format: users/{user_id}/product or users/{user_id}/service

        Args:
            user_id: User ID
            kb_type: Optional - "Product" or "Service"

        Returns:
            Folder path string
        """
        base_path = f"users/{user_id}"
        if kb_type:
            return f"{base_path}/{kb_type.lower()}"
        return base_path

    async def create_user_folders(self, user_id: int) -> Dict[str, Any]:
        """
        Create folder structure for a new user.
        Creates: users/{user_id}/product and users/{user_id}/service

        Note: Cloudinary doesn't have explicit folder creation API.
        Folders are created automatically when files are uploaded to them.
        This method prepares the folder paths for future use.

        Args:
            user_id: User ID

        Returns:
            Dictionary with folder paths
        """
        if not self.is_configured():
            raise Exception("Cloudinary is not configured")

        product_folder = self.get_user_folder_path(user_id, "Product")
        service_folder = self.get_user_folder_path(user_id, "Service")

        return {
            "success": True,
            "user_id": user_id,
            "folders": {
                "product": product_folder,
                "service": service_folder
            },
            "message": "Folder paths prepared. Folders will be created on first upload."
        }

    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        user_id: int,
        kb_type: str,
        resource_type: str = "auto"
    ) -> Dict[str, Any]:
        """
        Upload a file to Cloudinary.

        Args:
            file_content: File bytes
            filename: Original filename
            user_id: User ID
            kb_type: "Product" or "Service"
            resource_type: "image", "video", or "auto" (default)

        Returns:
            Dictionary with upload result including public URL
        """
        if not self.is_configured():
            raise Exception("Cloudinary is not configured")

        try:
            # Get user-specific folder path
            folder_path = self.get_user_folder_path(user_id, kb_type)

            # Upload file
            result = cloudinary.uploader.upload(
                file_content,
                folder=folder_path,
                resource_type=resource_type,
                use_filename=True,
                filename_override=filename,
                unique_filename=True,
                overwrite=False
            )

            return {
                "success": True,
                "public_id": result.get("public_id"),
                "url": result.get("secure_url"),
                "format": result.get("format"),
                "resource_type": result.get("resource_type"),
                "width": result.get("width"),
                "height": result.get("height"),
                "bytes": result.get("bytes"),
                "created_at": result.get("created_at")
            }

        except Exception as e:
            raise Exception(f"Failed to upload file to Cloudinary: {str(e)}")

    async def upload_multiple_files(
        self,
        files: List[Dict[str, Any]],
        user_id: int,
        kb_type: str
    ) -> Dict[str, Any]:
        """
        Upload multiple files to Cloudinary.

        Args:
            files: List of dicts with 'content' (bytes) and 'filename' (str)
            user_id: User ID
            kb_type: "Product" or "Service"

        Returns:
            Dictionary with upload results for all files
        """
        if not self.is_configured():
            raise Exception("Cloudinary is not configured")

        results = []
        errors = []

        for file_data in files:
            try:
                # Determine resource type based on file extension
                filename = file_data.get("filename", "")
                file_ext = filename.lower().split(".")[-1]

                if file_ext in ["jpg", "jpeg", "png", "gif", "webp", "svg"]:
                    resource_type = "image"
                elif file_ext in ["mp4", "mov", "avi", "wmv", "flv", "webm"]:
                    resource_type = "video"
                else:
                    resource_type = "auto"

                # Upload file
                upload_result = await self.upload_file(
                    file_content=file_data["content"],
                    filename=filename,
                    user_id=user_id,
                    kb_type=kb_type,
                    resource_type=resource_type
                )

                results.append({
                    "filename": filename,
                    "url": upload_result["url"],
                    "public_id": upload_result["public_id"],
                    "resource_type": upload_result["resource_type"]
                })

            except Exception as e:
                errors.append({
                    "filename": file_data.get("filename", "unknown"),
                    "error": str(e)
                })

        return {
            "success": len(errors) == 0,
            "uploaded": len(results),
            "failed": len(errors),
            "results": results,
            "errors": errors
        }

    async def delete_file(self, public_id: str) -> Dict[str, Any]:
        """
        Delete a file from Cloudinary.

        Args:
            public_id: Cloudinary public ID of the file

        Returns:
            Dictionary with deletion result
        """
        if not self.is_configured():
            raise Exception("Cloudinary is not configured")

        try:
            result = cloudinary.uploader.destroy(public_id)
            return {
                "success": True,
                "result": result
            }
        except Exception as e:
            raise Exception(f"Failed to delete file from Cloudinary: {str(e)}")

    async def get_user_media(
        self,
        user_id: int,
        kb_type: Optional[str] = None,
        max_results: int = 100
    ) -> Dict[str, Any]:
        """
        Get list of media files (images + videos) for a user.

        Args:
            user_id: User ID
            kb_type: Optional - filter by "Product" or "Service"
            max_results: Maximum number of results to return (per type)

        Returns:
            Dictionary with list of media files
        """
        if not self.is_configured():
            raise Exception("Cloudinary is not configured")

        try:
            folder_path = self.get_user_folder_path(user_id, kb_type)

            resources: List[Dict[str, Any]] = []

            # 1) images
            img_result = cloudinary.api.resources(
                type="upload",
                prefix=folder_path,
                resource_type="image",
                max_results=max_results,
            )
            resources.extend(img_result.get("resources", []))

            # 2) a video
            vid_result = cloudinary.api.resources(
                type="upload",
                prefix=folder_path,
                resource_type="video",
                max_results=max_results,
            )
            resources.extend(vid_result.get("resources", []))

            return {
                "success": True,
                "total": len(resources),
                "resources": resources,
            }

        except Exception as e:
            raise Exception(f"Failed to get media from Cloudinary: {str(e)}")


# Singleton instance
cloudinary_service = CloudinaryService()
