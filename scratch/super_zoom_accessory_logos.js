const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function superZoomAccessoryLogos() {
  const logoDir = path.join(__dirname, '../public/logo');
  if (!fs.existsSync(logoDir)) return;

  const files = [
    'JBL.png', 'jbl.png',
    'Boat.png', 'boat.png',
    'Noise.png', 'noise.png',
    'Anker.png', 'anker.png',
    'Spigen.png', 'spigen.png'
  ];

  for (const file of files) {
    const filePath = path.join(logoDir, file);
    if (!fs.existsSync(filePath)) continue;

    try {
      // Step 1: Crop tightly to pixel boundary threshold 1 (absolute border)
      const croppedBuffer = await sharp(filePath)
        .trim({ threshold: 1 })
        .toBuffer();

      const meta = await sharp(croppedBuffer).metadata();

      // Step 2: Scale up graphic dimensions by 1.8x - 2.0x
      const targetW = Math.round(meta.width * 1.8);
      const targetH = Math.round(meta.height * 1.8);

      const resizedBuffer = await sharp(croppedBuffer)
        .resize(targetW, targetH, {
          fit: 'fill',
          kernel: sharp.kernel.lanczos3
        })
        .png({ quality: 100 })
        .toBuffer();

      // Step 3: Trim tightly again to ensure zero padding
      const finalBuffer = await sharp(resizedBuffer)
        .trim({ threshold: 1 })
        .png({ quality: 100 })
        .toBuffer();

      fs.writeFileSync(filePath, finalBuffer);
      console.log(`SUPER ZOOMED -> ${file}`);
    } catch (err) {
      console.error(`Error super-zooming ${file}:`, err.message);
    }
  }
}

superZoomAccessoryLogos();
