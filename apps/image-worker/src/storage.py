"""
storage — Thin async wrapper for S3-compatible object storage.

Replace the body of `upload_bytes` with the real boto3 / aioboto3 / httpx-based
call for your storage provider (AWS S3, Cloudflare R2, MinIO, etc.).
"""

from .settings import settings


async def upload_bytes(key: str, data: bytes, content_type: str) -> str:
    """
    Upload raw bytes to the configured storage bucket.

    Args:
        key:          Object key (path inside the bucket).
        data:         Raw bytes to upload.
        content_type: MIME type (e.g. 'image/png', 'application/zip').

    Returns:
        The public URL of the uploaded object.

    TODO: replace stub with real S3/R2 SDK upload.
    """
    # STUB — log and return the expected public URL without actually uploading
    print(f"[storage] upload_bytes key={key} size={len(data)} content_type={content_type}")
    return get_public_url(key)


def get_public_url(key: str) -> str:
    """Return the public URL for a given storage key."""
    return f"{settings.storage_endpoint}/{settings.storage_bucket}/{key}"
