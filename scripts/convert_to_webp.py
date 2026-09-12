#!/usr/bin/env python3
"""
PixKart Image to WebP High-Clarity Batch Converter
===================================================
Converts PNG, JPG, JPEG, and other image formats into WebP format without losing image clarity.

Features:
- Lossless conversion for PNGs (100% clarity, retains transparency/alpha channel)
- High-clarity conversion for JPEGs (quality=95, method=6 for maximum compression efficiency & visual fidelity)
- Batch folder processing with recursive subfolder support
- Single file conversion
- Preserves ICC profiles and metadata
- Detailed summary showing KB saved and percentage compression

Requirements:
    pip install Pillow

Usage:
    python scripts/convert_to_webp.py --dir ./public
    python scripts/convert_to_webp.py --file ./public/logo.png
    python scripts/convert_to_webp.py --dir ./images --quality 98 --lossless
"""

import os
import sys
import argparse
import time
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("\n[!] Error: 'Pillow' is required to run this converter.")
    print("    Install it by running: pip install Pillow\n")
    sys.exit(1)

# Ensure UTF-8 output encoding on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"}

def format_bytes(size_in_bytes: int) -> str:
    """Formats bytes into human readable string (KB, MB)."""
    if size_in_bytes < 1024:
        return f"{size_in_bytes} B"
    elif size_in_bytes < 1024 * 1024:
        return f"{size_in_bytes / 1024:.2f} KB"
    else:
        return f"{size_in_bytes / (1024 * 1024):.2f} MB"

def convert_image_to_webp(
    source_path: Path,
    output_path: Path = None,
    quality: int = 95,
    force_lossless: bool = False,
    overwrite: bool = True,
    delete_original: bool = False
) -> tuple[bool, int, int, str]:
    """
    Converts a single image file to WebP format.
    
    Returns:
        (success: bool, orig_size: int, new_size: int, message: str)
    """
    if not source_path.exists():
        return False, 0, 0, f"File not found: {source_path}"
    
    if output_path is None:
        output_path = source_path.with_suffix(".webp")
    
    # Skip if output exists and overwrite is False
    if output_path.exists() and not overwrite and output_path != source_path:
        return False, 0, 0, f"Skipped (already exists): {output_path.name}"
    
    orig_size = source_path.stat().st_size
    temp_output_path = output_path.with_suffix(".tmp.webp") if output_path == source_path else output_path

    try:
        with Image.open(source_path) as img:
            # Handle orientation from EXIF tags if present
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass
            
            # Determine lossless vs lossy
            # PNGs with transparency or palette or high clarity default to lossless unless overridden
            is_png = source_path.suffix.lower() == ".png"
            use_lossless = force_lossless or is_png
            
            # Prepare save parameters for maximum clarity
            save_kwargs = {
                "format": "WEBP",
                "method": 6,  # Highest compression effort for best quality/size balance
            }
            
            # Preserve color profile if available
            icc_profile = img.info.get("icc_profile")
            if icc_profile:
                save_kwargs["icc_profile"] = icc_profile
                
            if use_lossless:
                save_kwargs["lossless"] = True
                # In lossless mode, quality controls compression effort, 100 = best
                save_kwargs["quality"] = 100
            else:
                save_kwargs["lossless"] = False
                save_kwargs["quality"] = quality
            
            # Ensure RGBA / RGB mode compatibility
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                img_to_save = img.convert("RGBA")
            elif img.mode != "RGB":
                img_to_save = img.convert("RGB")
            else:
                img_to_save = img

            temp_output_path.parent.mkdir(parents=True, exist_ok=True)
            img_to_save.save(temp_output_path, **save_kwargs)
            
        # If we wrote to a temporary file because input had the same name, replace it
        if temp_output_path != output_path:
            temp_output_path.replace(output_path)
            
        new_size = output_path.stat().st_size
        
        # Optionally delete original file
        if delete_original and source_path != output_path:
            source_path.unlink()
            
        savings = orig_size - new_size
        ratio = (savings / orig_size * 100) if orig_size > 0 else 0
        
        mode_str = "Lossless" if use_lossless else f"Quality={quality}"
        msg = f"[OK] {source_path.name} -> {output_path.name} [{mode_str}] ({format_bytes(orig_size)} -> {format_bytes(new_size)}, saved {ratio:.1f}%)"
        return True, orig_size, new_size, msg

    except Exception as e:
        if temp_output_path.exists() and temp_output_path != output_path:
            temp_output_path.unlink(missing_ok=True)
        return False, orig_size, 0, f"[ERROR] Error converting {source_path.name}: {str(e)}"

def process_directory(
    directory: Path,
    out_directory: Path = None,
    recursive: bool = True,
    quality: int = 95,
    force_lossless: bool = False,
    overwrite: bool = True,
    delete_original: bool = False
):
    """Processes all images in a directory."""
    if not directory.exists() or not directory.is_dir():
        print(f"[!] Directory does not exist: {directory}")
        return

    pattern = "**/*" if recursive else "*"
    all_files = list(directory.glob(pattern))
    image_files = [f for f in all_files if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS and f.suffix.lower() != ".webp"]

    if not image_files:
        print(f"[*] No convertible images (PNG/JPG/JPEG) found in: {directory}")
        return

    print(f"\n=======================================================")
    print(f"  PixKart WebP Image Batch Converter")
    print(f"=======================================================")
    print(f"  Directory:     {directory.resolve()}")
    print(f"  Images Found:  {len(image_files)}")
    print(f"  Lossless Mode: {'ENABLED (100% Lossless for PNGs)' if not force_lossless else 'FORCED LOSSLESS (All images)'}")
    print(f"  JPEG Quality:  {quality}/100 (Method 6 High Precision)")
    print(f"  Recursive:     {recursive}")
    print(f"-------------------------------------------------------\n")

    total_orig_size = 0
    total_new_size = 0
    success_count = 0
    fail_count = 0
    start_time = time.time()

    for idx, img_path in enumerate(image_files, 1):
        if out_directory:
            rel_path = img_path.relative_to(directory)
            target_out = (out_directory / rel_path).with_suffix(".webp")
        else:
            target_out = img_path.with_suffix(".webp")

        success, orig_sz, new_sz, msg = convert_image_to_webp(
            source_path=img_path,
            output_path=target_out,
            quality=quality,
            force_lossless=force_lossless,
            overwrite=overwrite,
            delete_original=delete_original
        )

        print(f"[{idx}/{len(image_files)}] {msg}")

        if success:
            success_count += 1
            total_orig_size += orig_sz
            total_new_size += new_sz
        else:
            fail_count += 1

    elapsed = time.time() - start_time
    total_saved = total_orig_size - total_new_size
    overall_ratio = (total_saved / total_orig_size * 100) if total_orig_size > 0 else 0

    print(f"\n=======================================================")
    print(f"  Conversion Summary")
    print(f"=======================================================")
    print(f"  Successful:    {success_count}")
    print(f"  Failed:        {fail_count}")
    print(f"  Original Size: {format_bytes(total_orig_size)}")
    print(f"  WebP Size:     {format_bytes(total_new_size)}")
    print(f"  Total Saved:   {format_bytes(total_saved)} ({overall_ratio:.1f}% reduction)")
    print(f"  Time Taken:    {elapsed:.2f} seconds")
    print(f"=======================================================\n")

def main():
    parser = argparse.ArgumentParser(
        description="Convert PNG/JPG/JPEG images to high-clarity WebP format."
    )
    parser.add_argument(
        "-d", "--dir",
        type=str,
        help="Path to directory containing images to convert"
    )
    parser.add_argument(
        "-f", "--file",
        type=str,
        help="Path to a single image file to convert"
    )
    parser.add_argument(
        "-o", "--out-dir",
        type=str,
        help="Optional output directory (default: same directory as input)"
    )
    parser.add_argument(
        "-q", "--quality",
        type=int,
        default=95,
        help="WebP quality for lossy images (1-100, default: 95 for ultra-high clarity)"
    )
    parser.add_argument(
        "-l", "--lossless",
        action="store_true",
        help="Force lossless mode for all images (zero quality loss)"
    )
    parser.add_argument(
        "--no-recursive",
        action="store_true",
        help="Do not scan subdirectories recursively"
    )
    parser.add_argument(
        "--no-overwrite",
        action="store_true",
        help="Do not overwrite existing .webp files"
    )
    parser.add_argument(
        "--delete-original",
        action="store_true",
        help="Delete original images after converting to WebP"
    )

    args = parser.parse_args()

    if args.file:
        file_path = Path(args.file)
        out_path = Path(args.out_dir) / file_path.with_suffix(".webp").name if args.out_dir else None
        success, orig, new, msg = convert_image_to_webp(
            source_path=file_path,
            output_path=out_path,
            quality=args.quality,
            force_lossless=args.lossless,
            overwrite=not args.no_overwrite,
            delete_original=args.delete_original
        )
        print(f"\n{msg}\n")
    elif args.dir:
        dir_path = Path(args.dir)
        out_dir_path = Path(args.out_dir) if args.out_dir else None
        process_directory(
            directory=dir_path,
            out_directory=out_dir_path,
            recursive=not args.no_recursive,
            quality=args.quality,
            force_lossless=args.lossless,
            overwrite=not args.no_overwrite,
            delete_original=args.delete_original
        )
    else:
        # Default to current workspace /public if no args provided
        default_dir = Path("./public")
        if default_dir.exists():
            print(f"[*] No arguments provided. Processing default directory: {default_dir.resolve()}")
            process_directory(
                directory=default_dir,
                recursive=True,
                quality=args.quality,
                force_lossless=args.lossless,
                overwrite=not args.no_overwrite,
                delete_original=args.delete_original
            )
        else:
            parser.print_help()

if __name__ == "__main__":
    main()
