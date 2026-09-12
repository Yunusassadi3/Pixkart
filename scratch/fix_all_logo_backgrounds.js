const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processLogos() {
  const logoDir = path.join(__dirname, '../public/logo');
  if (!fs.existsSync(logoDir)) return;

  const files = fs.readdirSync(logoDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

  for (const file of files) {
    const filePath = path.join(logoDir, file);
    try {
      // Ensure image is RGBA (4 channels)
      const image = sharp(filePath).ensureAlpha();
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      const width = info.width;
      const height = info.height;
      const channels = info.channels; // 4 channels (R, G, B, A)

      // Replace all light/white background pixels with 100% transparent alpha (0)
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Any pixel where R, G, B are all > 210 (white or near white) becomes fully transparent
        if (r > 210 && g > 210 && b > 210) {
          data[i + 3] = 0; // Alpha = 0
        }
      }

      // Convert buffer back to PNG, trim extra transparent outer space, and add 10px padding canvas
      const trimmedBuffer = await sharp(data, {
        raw: {
          width: width,
          height: height,
          channels: channels
        }
      })
      .trim({ threshold: 5 }) // Crop out all transparent borders
      .png({ quality: 100 })
      .toBuffer();

      // Add a 10% clean padding box so logo graphics don't touch the edge awkwardly
      const metadata = await sharp(trimmedBuffer).metadata();
      const padW = Math.round(metadata.width * 0.1);
      const padH = Math.round(metadata.height * 0.1);

      const finalBuffer = await sharp(trimmedBuffer)
        .extend({
          top: padH,
          bottom: padH,
          left: padW,
          right: padW,
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Pure transparent extension
        })
        .png({ quality: 100 })
        .toBuffer();

      // If file was .jpg, output to .png as well
      const targetPngPath = filePath.endsWith('.jpg') ? filePath.replace('.jpg', '.png') : filePath;
      fs.writeFileSync(targetPngPath, finalBuffer);

      console.log(`Successfully made 100% transparent -> ${path.basename(targetPngPath)}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
}

processLogos();
