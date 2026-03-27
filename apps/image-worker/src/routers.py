"""FastAPI routers for the image worker."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .compose_sheet import compose_sheet
from .normalize import normalize_to_cell
from .trim_alpha import trim_transparency
from .export_zip import build_export_zip
from .storage import upload_bytes, get_public_url

compose_router = APIRouter()


class CompositionRequest(BaseModel):
    job_id: str
    project_id: str
    engine: str
    # List of (asset_id, image_url, row, col, pivot_x, pivot_y) tuples
    placements: list[dict]
    columns: int
    rows: int
    cell_width: int
    cell_height: int
    margin: int = 0
    padding: int = 0
    animations: dict = {}  # {name: [frame_indices], fps: {name: int}}
    godot_manifest: dict | None = None
    unity_manifest: dict | None = None


class CompositionResult(BaseModel):
    result_url: str
    sheet_key: str


@compose_router.post("/compose", response_model=CompositionResult)
async def compose(req: CompositionRequest) -> CompositionResult:
    """
    1. Download all frames from their URLs.
    2. Normalize each to cell size.
    3. Compose into a sprite sheet.
    4. Build ZIP with PNG + manifests.
    5. Upload to storage.
    6. Return download URL.
    """
    import httpx
    from PIL import Image
    import io

    frames: list[Image.Image] = []

    # ── Download & normalize each frame ──────────────────────────────────────
    async with httpx.AsyncClient(timeout=30) as client:
        for placement in req.placements:
            url = placement.get("image_url", "")
            if not url:
                # blank frame — transparent placeholder
                frames.append(
                    Image.new("RGBA", (req.cell_width, req.cell_height), (0, 0, 0, 0))
                )
                continue
            resp = await client.get(url)
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Failed to fetch frame: {url}")
            img = Image.open(io.BytesIO(resp.content)).convert("RGBA")
            img = trim_transparency(img)
            img = normalize_to_cell(img, req.cell_width, req.cell_height)
            frames.append(img)

    # ── Compose sprite sheet ──────────────────────────────────────────────────
    sheet = compose_sheet(
        images=frames,
        columns=req.columns,
        rows=req.rows,
        cell_w=req.cell_width,
        cell_h=req.cell_height,
        margin=req.margin,
        padding=req.padding,
    )

    # ── Build ZIP ─────────────────────────────────────────────────────────────
    manifest = req.godot_manifest if req.engine == "godot" else req.unity_manifest
    zip_bytes = build_export_zip(
        sheet=sheet,
        manifest=manifest or {},
        engine=req.engine,
    )

    # ── Upload ────────────────────────────────────────────────────────────────
    sheet_key = f"exports/{req.project_id}/{req.job_id}/spritesheet.zip"
    await upload_bytes(sheet_key, zip_bytes, "application/zip")
    result_url = get_public_url(sheet_key)

    return CompositionResult(result_url=result_url, sheet_key=sheet_key)
