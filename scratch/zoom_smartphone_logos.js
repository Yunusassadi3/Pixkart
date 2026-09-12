const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function zoomAllLogos() {
  const logoDir = path.join(__dirname, '../public/logo');
  if (!fs.existsSync(logoDir)) return;

  const files = fs.readdirSync(logoDir).filter(f => f.endsWith('.png'));

  for (const file of files) {
    const filePath = path.join(logoDir, file);
    try {
      // Trim empty space around graphic artwork
      const trimmedBuffer = await sharp(filePath)
        .trim({ threshold: 5 })
        .toBuffer();

      const meta = await sharp(trimmedBuffer).metadata();
      
      // Extend with minimal 2% padding canvas for maximum zoom fill
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
      console.log(`Zoomed & cropped -> ${file}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
}

zoomAllLogos();
