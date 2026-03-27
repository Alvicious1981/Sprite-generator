"""
trim_alpha — Remove fully transparent rows/columns from sprite borders.

This ensures sprites are centered on actual content rather than whitespace,
giving normalize_to_cell a tighter bounding box to work with.
"""

from PIL import Image


def trim_transparency(image: Image.Image) -> Image.Image:
    """
    Crop fully transparent rows and columns from the edges of an RGBA image.

    If the image has no alpha channel (RGB/P/etc.) it is returned as-is.
    If the entire image is transparent, the original image is returned.

    Args:
        image: Input PIL Image (any mode).

    Returns:
        Cropped RGBA PIL Image, or the original if no trimming was possible.
    """
    if image.mode != "RGBA":
        image = image.convert("RGBA")

    # Extract alpha channel
    alpha = image.getchannel("A")

    # Get bounding box of non-zero alpha pixels
    bbox = alpha.getbbox()
    if bbox is None:
        # Entire image is transparent — return 1×1 to avoid zero-size issues
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0))

    return image.crop(bbox)
