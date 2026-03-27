"""
normalize — Fit a sprite into a fixed cell, respecting anchor alignment.

Workflow:
1. Scale the sprite so it fits inside (cell_w × cell_h) while preserving aspect ratio.
2. Place it on a transparent cell canvas aligned to the given anchor.

Supported anchors:
  bottom_center  — default for most game characters (feet at bottom)
  center         — centered
  top_left       — raw origin placement
"""

from PIL import Image


_ANCHORS = ("bottom_center", "center", "top_left")


def normalize_to_cell(
    image: Image.Image,
    cell_w: int,
    cell_h: int,
    anchor: str = "bottom_center",
) -> Image.Image:
    """
    Fit `image` inside a transparent canvas of size (cell_w × cell_h).

    Args:
        image:   Input RGBA sprite (ideally already trimmed).
        cell_w:  Target cell width in pixels.
        cell_h:  Target cell height in pixels.
        anchor:  One of 'bottom_center', 'center', 'top_left'.

    Returns:
        RGBA PIL Image of exactly (cell_w × cell_h).

    Raises:
        ValueError: If `anchor` is not one of the supported values.
    """
    if anchor not in _ANCHORS:
        raise ValueError(f"anchor must be one of {_ANCHORS}, got {anchor!r}")

    if image.mode != "RGBA":
        image = image.convert("RGBA")

    src_w, src_h = image.size
    if src_w == 0 or src_h == 0:
        return Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0))

    # Scale to fit, preserving aspect ratio
    scale = min(cell_w / src_w, cell_h / src_h)
    new_w = max(1, round(src_w * scale))
    new_h = max(1, round(src_h * scale))
    scaled = image.resize((new_w, new_h), Image.NEAREST)

    canvas = Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0))

    if anchor == "bottom_center":
        x = (cell_w - new_w) // 2
        y = cell_h - new_h
    elif anchor == "center":
        x = (cell_w - new_w) // 2
        y = (cell_h - new_h) // 2
    else:  # top_left
        x, y = 0, 0

    canvas.paste(scaled, (x, y), mask=scaled)
    return canvas
