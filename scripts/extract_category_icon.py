import os
from PIL import Image
import numpy as np

def extract_category_icon():
    src_path = r"C:\Users\yunus\.gemini\antigravity-ide\brain\1142125a-e210-425c-90f3-61a388259a68\.user_uploaded\media_1787996346799.jpg"
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        return

    img = Image.open(src_path).convert("RGBA")
    data = np.array(img).astype(np.float32)

    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # Calculate distance from black (0, 0, 0)
    brightness = np.maximum(r, np.maximum(g, b))

    # Pixels with brightness < 15 become transparent, smoothly transition to 45
    alpha = np.clip((brightness - 12.0) / 35.0 * 255.0, 0.0, 255.0).astype(np.uint8)

    rgba_out = np.dstack((data[:, :, :3].astype(np.uint8), alpha))
    clean_icon = Image.fromarray(rgba_out, mode="RGBA")

    # Crop tightly to non-zero alpha
    bbox = clean_icon.getbbox()
    if bbox:
        clean_icon = clean_icon.crop(bbox)

    # Pad to a clean square with 8% padding
    ew, eh = clean_icon.size
    max_d = max(ew, eh)
    pad = int(max_d * 0.08)
    canvas_size = max_d + (pad * 2)

    square_icon = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    square_icon.paste(clean_icon, ((canvas_size - ew) // 2, (canvas_size - eh) // 2), clean_icon)

    out_path = r"D:\mob\public\images\custom-category-icon.png"
    square_icon.save(out_path, "PNG")
    print(f"Saved custom category icon: {out_path}")

if __name__ == "__main__":
    extract_category_icon()
