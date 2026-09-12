import os
from PIL import Image
import numpy as np

def create_frameless_transparent_ribbon_p():
    src_path = r"D:\mob\public\images\logos\pixkart_myntra_style_1787965617540.jpg"
    if not os.path.exists(src_path):
        src_path = r"C:\Users\yunus\.gemini\antigravity-ide\brain\1142125a-e210-425c-90f3-61a388259a68\pixkart_myntra_style_1787965617540.jpg"

    print(f"Opening source image: {src_path}")
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size

    # 1. Crop only the upper ribbon "P" emblem (excluding the text below)
    crop_top = int(h * 0.12)
    crop_bottom = int(h * 0.65)
    crop_left = int(w * 0.20)
    crop_right = int(w * 0.80)

    cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))
    data = np.array(cropped).astype(np.float32)

    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # 2. Extract 100% transparent background (NO circular frame, NO background color)
    dist_from_white = np.sqrt((255.0 - r)**2 + (255.0 - g)**2 + (255.0 - b)**2)
    alpha = np.clip((dist_from_white - 15.0) / 40.0 * 255.0, 0.0, 255.0).astype(np.uint8)

    alpha_norm = (alpha.astype(np.float32) / 255.0)[:, :, np.newaxis]
    alpha_safe = np.maximum(alpha_norm, 0.001)
    rgb = data[:, :, :3]
    rgb_clean = np.clip((rgb - 255.0 * (1.0 - alpha_norm)) / alpha_safe, 0.0, 255.0).astype(np.uint8)

    rgba_out = np.dstack((rgb_clean, alpha))
    clean_emblem = Image.fromarray(rgba_out, mode="RGBA")

    # Tight crop to non-zero alpha
    bbox = clean_emblem.getbbox()
    if bbox:
        clean_emblem = clean_emblem.crop(bbox)

    # Place in a clean square transparent canvas with 6% breathing room
    ew, eh = clean_emblem.size
    max_d = max(ew, eh)
    pad = int(max_d * 0.06)
    canvas_size = max_d + (pad * 2)

    square_logo = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    square_logo.paste(clean_emblem, ((canvas_size - ew) // 2, (canvas_size - eh) // 2), clean_emblem)

    # 3. Save 100% frameless transparent PNGs
    out_icon_png = r"D:\mob\public\images\pixkart-icon.png"
    out_logo_png = r"D:\mob\public\images\pixkart-logo.png"
    square_logo.save(out_icon_png, "PNG")
    square_logo.save(out_logo_png, "PNG")
    print(f"Saved frameless transparent PNG: {out_icon_png} and {out_logo_png}")

    # 4. Save Next.js App Router dynamic icon (512x512)
    app_icon_png = r"D:\mob\src\app\icon.png"
    square_logo.resize((512, 512), Image.Resampling.LANCZOS).save(app_icon_png, "PNG")
    print(f"Saved Next.js app icon: {app_icon_png}")

    # 5. Save multi-size favicon.ico (100% frameless transparent)
    fav_public_path = r"D:\mob\public\favicon.ico"
    fav_app_path = r"D:\mob\src\app\favicon.ico"
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    square_logo.save(fav_public_path, format="ICO", sizes=icon_sizes)
    square_logo.save(fav_app_path, format="ICO", sizes=icon_sizes)
    print(f"Saved favicon.ico: {fav_public_path}")

    # 6. Save Apple Touch Icon and standard favicon PNGs
    square_logo.resize((180, 180), Image.Resampling.LANCZOS).save(r"D:\mob\public\apple-touch-icon.png", "PNG")
    square_logo.resize((32, 32), Image.Resampling.LANCZOS).save(r"D:\mob\public\favicon-32x32.png", "PNG")
    square_logo.resize((16, 16), Image.Resampling.LANCZOS).save(r"D:\mob\public\favicon-16x16.png", "PNG")
    print("Frameless transparent Ribbon P logo and favicon restored successfully!")

if __name__ == "__main__":
    create_frameless_transparent_ribbon_p()
