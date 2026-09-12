import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def make_circular_transparent_logo():
    src_path = r"D:\mob\public\images\pixkart-logo.jpg"
    if not os.path.exists(src_path):
        src_path = r"C:\Users\yunus\.gemini\antigravity-ide\brain\1142125a-e210-425c-90f3-61a388259a68\pixkart_black_yellow_logo_1787947044962.jpg"

    print(f"Opening source image: {src_path}")
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size

    # The circular neon ring is centered. Let's find the circle center & radius.
    center_x, center_y = w // 2, h // 2
    # The outer glow extends to ~45% of the width
    radius = int(min(w, h) * 0.44)

    # Create a smooth antialiased circular mask
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw solid inner circle
    draw.ellipse(
        (center_x - radius, center_y - radius, center_x + radius, center_y + radius),
        fill=255
    )

    # Apply a subtle blur to the outer mask edge for ultra-smooth antialiasing
    # Feather edge by 3-4 pixels
    feathered_mask = mask.filter(ImageFilter.GaussianBlur(radius=3))

    # Apply alpha mask
    transparent_img = img.copy()
    transparent_img.putalpha(feathered_mask)

    # Crop tightly to the bounding box of non-zero alpha
    bbox = transparent_img.getbbox()
    if bbox:
        transparent_img = transparent_img.crop(bbox)

    # Make it a perfect square with equal padding
    tw, th = transparent_img.size
    max_dim = max(tw, th)
    square_img = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    square_img.paste(transparent_img, ((max_dim - tw) // 2, (max_dim - th) // 2))

    # 1. Save high-res transparent PNGs
    out_icon_png = r"D:\mob\public\images\pixkart-icon.png"
    out_logo_png = r"D:\mob\public\images\pixkart-logo.png"
    square_img.save(out_icon_png, "PNG")
    square_img.save(out_logo_png, "PNG")
    print(f"Saved transparent PNG: {out_icon_png}")

    # 2. Save Next.js App Router icon.png in src/app/
    app_icon_png = r"D:\mob\src\app\icon.png"
    app_icon_512 = square_img.resize((512, 512), Image.Resampling.LANCZOS)
    app_icon_512.save(app_icon_png, "PNG")
    print(f"Saved App icon: {app_icon_png}")

    # 3. Save favicon.ico (multi-size ICO: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
    fav_public_path = r"D:\mob\public\favicon.ico"
    fav_app_path = r"D:\mob\src\app\favicon.ico"
    
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    square_img.save(fav_public_path, format="ICO", sizes=icon_sizes)
    square_img.save(fav_app_path, format="ICO", sizes=icon_sizes)
    print(f"Saved favicon.ico to public and src/app: {fav_public_path}")

    # 4. Save standard apple-touch-icon.png and favicon-32x32.png
    square_img.resize((180, 180), Image.Resampling.LANCZOS).save(r"D:\mob\public\apple-touch-icon.png", "PNG")
    square_img.resize((32, 32), Image.Resampling.LANCZOS).save(r"D:\mob\public\favicon-32x32.png", "PNG")
    square_img.resize((16, 16), Image.Resampling.LANCZOS).save(r"D:\mob\public\favicon-16x16.png", "PNG")
    print("All favicon and transparent logo assets generated successfully!")

if __name__ == "__main__":
    make_circular_transparent_logo()
