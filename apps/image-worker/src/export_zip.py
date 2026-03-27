"""
export_zip — Package a sprite sheet PNG and engine manifest into a ZIP archive.

Produces:
  spritesheet.png          — the composed atlas
  godot_manifest.json      — (when engine == 'godot')
  unity_manifest.json      — (when engine == 'unity')
  manifest.json            — always included (engine-agnostic copy)
"""

import io
import json
import zipfile
from PIL import Image


def build_export_zip(
    sheet: Image.Image,
    manifest: dict,
    engine: str,
) -> bytes:
    """
    Build a ZIP archive containing the sprite sheet and JSON manifest.

    Args:
        sheet:    Composed RGBA PIL Image (the final sprite sheet).
        manifest: Dict with engine-specific export data.
        engine:   One of 'godot', 'unity', 'generic'.

    Returns:
        Raw bytes of the ZIP archive.
    """
    buf = io.BytesIO()

    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        # ── Sprite sheet ──────────────────────────────────────────────────────
        png_buf = io.BytesIO()
        sheet.save(png_buf, format="PNG", optimize=True)
        zf.writestr("spritesheet.png", png_buf.getvalue())

        # ── Engine-specific manifest ──────────────────────────────────────────
        manifest_json = json.dumps(manifest, indent=2)
        if engine == "godot":
            zf.writestr("godot_manifest.json", manifest_json)
        elif engine == "unity":
            zf.writestr("unity_manifest.json", manifest_json)

        # ── Generic manifest (always present) ────────────────────────────────
        zf.writestr("manifest.json", manifest_json)

    buf.seek(0)
    return buf.read()
