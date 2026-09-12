import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def make_frameless_transparent_logo():
    src_path = r"C:\Users\yunus\.gemini\antigravity-ide\brain\1142125a-e210-425c-90f3-61a388259a68\pixkart_black_yellow_logo_1787947044962.jpg"
    if not os.path.exists(src_path):
        src_path = r"D:\mob\public\images\pixkart-logo.jpg"

    print(f"Opening source image: {src_path}")
    img = Image.open(src_path).convert("RGBA")
    
    # Load as numpy array to perform precise color/luminance-based background removal
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # In this image:
    # 1. The outer neon ring is at the perimeter.
    # 2. The inner black background is pure/near-black (R < 35, G < 35, B < 35).
    # 3. The phone has gold borders (R > 120, G > 90) and black body.
    # 4. The lightning & cart are bright yellow/gold (R > 180, G > 140, B < 100).
    # 5. The text "PIXKART ONLINE SHOPPING" is at the bottom.

    # We want to isolate the phone + cart + lightning emblem inside (excluding the outer yellow neon circle and bottom text).
    h, w, _ = data.shape
    center_x, center_y = w // 2, int(h * 0.44)
    # Target inner emblem bounds
    radius = int(min(w, h) * 0.30)

    # Let's crop to the inner emblem area:
    # Top: ~18% to 68%, Left: ~25% to 75%
    crop_top = int(h * 0.18)
    crop_bottom = int(h * 0.68)
    crop_left = int(w * 0.25)
    crop_right = int(w * 0.75)

    cropped_img = img.crop((crop_left, crop_top, crop_right, crop_bottom))
    cw, ch = cropped_img.size
    cdata = np.array(cropped_img)

    cr, cg, cb, ca = cdata[:, :, 0], cdata[:, :, 1], cdata[:, :, 2], cdata[:, :, 3]

    # Create transparency mask:
    # Yellow/Gold elements: high red and green
    # Phone outline & accents: gold/yellow
    # Black phone body: we keep the phone body solid black with an alpha mask
    
    # Let's create a clean alpha mask where anything truly outside the phone/cart/lightning is transparent
    # Calculate brightness / saturation
    brightness = 0.299 * cr + 0.587 * cg + 0.114 * cb
    is_yellow = (cr > 100) & (cg > 80) & (cb < 160)
    is_bright = brightness > 50

    # For the phone screen/body (which is black inside the gold phone border):
    # We create a solid fill inside the phone border box
    alpha_mask = np.zeros((ch, cw), dtype=np.uint8)

    # Where there's yellow/gold, set high alpha
    alpha_mask[is_yellow] = 255
    alpha_mask[is_bright] = 255

    # Refine mask with morphological closing / filling
    from PIL import ImageMorph
    mask_pil = Image.fromarray(alpha_mask, mode="L")
    mask_pil = mask_pil.filter(ImageFilter.MaxFilter(3))
    mask_pil = mask_pil.filter(ImageFilter.GaussianBlur(1))

    # Apply alpha to cropped image
    cdata[:, :, 3] = np.array(mask_pil)
    final_emblem = Image.fromarray(cdata, mode="RGBA")

    # Crop tightly to non-zero alpha
    bbox = final_emblem.getbbox()
    if bbox:
        final_emblem = final_emblem.crop(bbox)

    # Place in square canvas
    ew, eh = final_emblem.size
    max_d = max(ew, eh)
    square_logo = Image.new("RGBA", (max_d + 20, max_d + 20), (0, 0, 0, 0))
    square_logo.paste(final_emblem, ((max_d + 20 - ew) // 2, (max_d + 20 - eh) // 2))

    # Save transparent frameless PNGs
    out_icon_png = r"D:\mob\public\images\pixkart-icon.png"
    out_logo_png = r"D:\mob\public\images\pixkart-logo.png"
    square_logo.save(out_icon_png, "PNG")
    square_logo.save(out_logo_png, "PNG")
    print(f"Saved frameless transparent PNG: {out_icon_png}")

    # Next.js App Router icon
    app_icon_png = r"D:\mob\src\app\icon.png"
    square_logo.resize((512, 512), Image.Resampling.LANCZOS).save(app_icon_png, "PNG")

    # Multi-size Favicon.ico
    fav_public_path = r"D:\mob\public\favicon.ico"
    fav_app_path = r"D:\mob\src\app\favicon.ico"
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    square_logo.save(fav_public_path, format="ICO", sizes=icon_sizes)
    square_logo.save(fav_app_path, format="ICO", sizes=icon_sizes)

    square_logo.resize((180, 180), Image.Resampling.LANCZOS).save(r"D:\mob\public\apple-touch-icon.png", "PNG")
    square_logo.resize((32, 32), Image.Resampling.LANCZOS).save(r"D:\mob\public\favicon-32x32.png", "PNG")
    square_logo.resize((16, 16), Image.Resampling.LANCZOS).save(r"D:\mob\public\favicon-16x16.png", "PNG")
    print("Frameless favicon & transparent logo generation complete!")

if __name__ == "__main__":
    make_frameless_transparent_logo()
