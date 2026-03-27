"""
storage — Write files to local disk or S3-compatible storage.

Controlled by the STORAGE_MODE env var:
  local  → writes bytes to UPLOADS_DIR, returns PUBLIC_URL/uploads/<key>
  s3     → (TODO) boto3/aioboto3 upload
"""

import os
from .settings import settings


async def upload_bytes(key: str, data: bytes, content_type: str) -> str:
    """
    Persist raw bytes and return the public URL for the stored object.

    Args:
        key:          Storage key / relative path (e.g. 'projects/uuid/sprites/uuid.png').
        data:         Raw bytes to store.
        content_type: MIME type (informational; used by S3 mode).

    Returns:
        Public URL string.
    """
    if settings.storage_mode == "local":
        return _write_local(key, data)

    # TODO: replace with real boto3/aioboto3 call
    print(f"[storage] S3 not implemented — falling back to local for key={key}")
    return _write_local(key, data)


def get_public_url(key: str) -> str:
    """Return the public URL for a given storage key."""
    return f"{settings.public_url}/uploads/{key}"


def _write_local(key: str, data: bytes) -> str:
    full_path = os.path.join(settings.uploads_dir, key)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "wb") as f:
        f.write(data)
    url = get_public_url(key)
    print(f"[storage] saved {key} ({len(data)} bytes) → {url}")
    return url
