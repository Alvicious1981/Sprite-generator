"""
compose_sheet — Deterministic sprite sheet composition with Pillow.

Responsible for:
- Placing frames into a grid (columns × rows)
- Applying per-cell margin and padding
- Returning the final RGBA PIL Image

This module makes NO creative decisions. All layout parameters are provided
by the caller (API or router).
"""

from PIL import Image


def compose_sheet(
    images: list[Image.Image],
    columns: int,
    rows: int,
    cell_w: int,
    cell_h: int,
    margin: int = 0,
    padding: int = 0,
) -> Image.Image:
    """
    Compose `images` into a sprite sheet grid.

    Args:
        images:   Ordered list of RGBA frames (must be <= columns * rows).
        columns:  Number of columns in the grid.
        rows:     Number of rows in the grid.
        cell_w:   Width of each cell (pixels, excluding padding/margin).
        cell_h:   Height of each cell (pixels, excluding padding/margin).
        margin:   Space between cells (pixels).
        padding:  Transparent border inside each cell (pixels).

    Returns:
        RGBA PIL Image containing the composed sprite sheet.
    """
    cell_outer_w = cell_w + padding * 2
    cell_outer_h = cell_h + padding * 2
    sheet_w = columns * cell_outer_w + (columns - 1) * margin
    sheet_h = rows * cell_outer_h + (rows - 1) * margin

    sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))

    for idx, img in enumerate(images):
        if idx >= columns * rows:
            break
        row = idx // columns
        col = idx % columns

        x = col * (cell_outer_w + margin) + padding
        y = row * (cell_outer_h + margin) + padding

        # Resize if the frame doesn't exactly match cell size (safety net)
        if img.size != (cell_w, cell_h):
            img = img.resize((cell_w, cell_h), Image.NEAREST)

        sheet.paste(img, (x, y), mask=img if img.mode == "RGBA" else None)

    return sheet
