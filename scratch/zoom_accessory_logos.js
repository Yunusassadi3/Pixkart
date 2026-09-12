const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function zoomAccessoryLogos() {
  const logoDir = path.join(__dirname, '../public/logo');
  if (!fs.existsSync(logoDir)) return;

  const accessoryFiles = [
    'JBL.png', 'Boat.png', 'Noise.png', 'Anker.png', 'Spigen.png',
    'jbl.png', 'boat.png', 'noise.png', 'anker.png', 'spigen.png'
  ];

  for (const file of accessoryFiles) {
    const filePath = path.join(logoDir, file);
    if (!fs.existsSync(filePath)) continue;

    try {
      // Load image & trim all empty transparent border space down to exact pixel boundary
      const trimmedBuffer = await sharp(filePath)
        .trim({ threshold: 5 })
        .toBuffer();

      // Upscale/zoom the graphic and re-save with minimal padding
      const meta = await sharp(trimmedBuffer).metadata();
      
      // Extend with tiny 2% padding so logo fills max space
      const padW = Math.max(2, Math.round(meta.width * 0.02));
      const padH = Math.max(2, Math.round(meta.height * 0.02));

      const zoomedBuffer = await sharp(trimmedBuffer)
        .extend({
          top: padH,
          bottom: padH,
          left: padW,
          right: padW,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 100 })
        .toBuffer();

      fs.writeFileSync(filePath, zoomedBuffer);
      console.log(`Zoomed and tightly cropped -> ${file}`);
    } catch (err) {
      console.error(`Error zooming ${file}:`, err.message);
    }
  }
}

zoomAccessoryLogos();
