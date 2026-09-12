import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def create_circular_white_frame_logo():
    src_path = r"D:\mob\public\images\logos\pixkart_myntra_style_1787965617540.jpg"
    if not os.path.exists(src_path):
        src_path = r"C:\Users\yunus\.gemini\antigravity-ide\brain\1142125a-e210-425c-90f3-61a388259a68\pixkart_myntra_style_1787965617540.jpg"

    print(f"Opening source image: {src_path}")
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size

    # 1. Crop only the upper ribbon "P" emblem
    crop_top = int(h * 0.12)
    crop_bottom = int(h * 0.65)
    crop_left = int(w * 0.20)
    crop_right = int(w * 0.80)

    cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))
    data = np.array(cropped).astype(np.float32)

    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # Smooth alpha extraction from white background
    dist_from_white = np.sqrt((255.0 - r)**2 + (255.0 - g)**2 + (255.0 - b)**2)
    alpha = np.clip((dist_from_white - 15.0) / 40.0 * 255.0, 0.0, 255.0).astype(np.uint8)

    alpha_norm = (alpha.astype(np.float32) / 255.0)[:, :, np.newaxis]
    alpha_safe = np.maximum(alpha_norm, 0.001)
    rgb = data[:, :, :3]
    rgb_clean = np.clip((rgb - 255.0 * (1.0 - alpha_norm)) / alpha_safe, 0.0, 255.0).astype(np.uint8)

    rgba_out = np.dstack((rgb_clean, alpha))
    clean_emblem = Image.fromarray(rgba_out, mode="RGBA")

    bbox = clean_emblem.getbbox()
    if bbox:
        clean_emblem = clean_emblem.crop(bbox)

    # 2. Build high-resolution 1024x1024 circular white frame
    canvas_size = 1024
    scale_factor = 4  # 4x supersampling for ultra smooth antialiasing
    super_size = canvas_size * scale_factor

    # Create supersampled canvas
    super_img = Image.new("RGBA", (super_size, super_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(super_img)

    # Circle radius with slight outer margin
    circle_margin = int(super_size * 0.02)
    circle_bbox = [circle_margin, circle_margin, super_size - circle_margin, super_size - circle_margin]

    # Draw solid pure white circle
    draw.ellipse(circle_bbox, fill=(255, 255, 255, 255))

    # Scale down circle for perfect antialiasing
    circle_canvas = super_img.resize((canvas_size, canvas_size), Image.Resampling.LANCZOS)

    # 3. Make the emblem "little bigger" inside the white circle frame (~78% of circle diameter)
    target_inner_h = int(canvas_size * 0.78)
    aspect = clean_emblem.width / clean_emblem.height
    target_inner_w = int(target_inner_h * aspect)

    emblem_resized = clean_emblem.resize((target_inner_w, target_inner_h), Image.Resampling.LANCZOS)

    # Center the emblem inside the circular white canvas
    paste_x = (canvas_size - target_inner_w) // 2
    paste_y = (canvas_size - target_inner_h) // 2

    # Composite emblem onto circular white frame
    final_circular_logo = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    final_circular_logo.paste(circle_canvas, (0, 0), circle_canvas)
    final_circular_logo.paste(emblem_resized, (paste_x, paste_y), emblem_resized)

    # 4. Save transparent PNG with circular white frame
    out_icon_png = r"D:\mob\public\images\pixkart-icon.png"
    out_logo_png = r"D:\mob\public\images\pixkart-logo.png"
    final_circular_logo.save(out_icon_png, "PNG")
    final_circular_logo.save(out_logo_png, "PNG")
    print(f"Saved circular white framed PNG: {out_icon_png} and {out_logo_png}")

    # 5. Save Next.js App Router dynamic icon (512x512)
    app_icon_png = r"D:\mob\src\app\icon.png"
    final_circular_logo.resize((512, 512), Image.Resampling.LANCZOS).save(app_icon_png, "PNG")
    print(f"Saved Next.js app icon: {app_icon_png}")

    # 6. Save multi-size favicon.ico with circular white frame
    fav_public_path = r"D:\mob\public\favicon.ico"
    fav_app_path = r"D:\mob\src\app\favicon.ico"
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    final_circular_logo.save(fav_public_path, format="ICO", sizes=icon_sizes)
    final_circular_logo.save(fav_app_path, format="ICO", sizes=icon_sizes)
    print(f"Saved favicon.ico with circular white frame: {fav_public_path}")

    # 7. Save Apple Touch Icon and standard favicon PNGs
    final_circular_logo.resize((180, 180), Image.Resampling.LANCZOS).save(r"D:\mob\public\apple-touch-icon.png", "PNG")
    final_circular_logo.resize((32, 32), Image.Resampling.LANCZOS).save(r"D:\mob\public\favicon-32x32.png", "PNG")
    final_circular_logo.resize((16, 16), Image.Resampling.LANCZOS).save(r"D:\mob\public\favicon-16x16.png", "PNG")
    print("Circular white frame logo and favicon export complete!")

if __name__ == "__main__":
    create_circular_white_frame_logo()
