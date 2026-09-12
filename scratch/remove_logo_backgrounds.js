const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function removeBackgrounds() {
  const logoDir = path.join(__dirname, '../public/logo');
  if (!fs.existsSync(logoDir)) return;

  const files = fs.readdirSync(logoDir).filter(f => f.endsWith('.png'));

  for (const file of files) {
    const filePath = path.join(logoDir, file);
    try {
      const image = sharp(filePath);
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      // Convert solid white / near-white background (R,G,B > 240) to transparent
      const channels = info.channels;
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 240 && g > 240 && b > 240) {
          if (channels === 4) {
            data[i + 3] = 0; // Transparent alpha
          }
        }
      }

      // Re-create PNG from modified buffer, trim empty transparent borders, and save
      const processedBuffer = await sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: info.channels
        }
      })
      .trim({ threshold: 10 }) // Trim extra transparent padding so logo fits frame
      .png({ quality: 100 })
      .toBuffer();

      fs.writeFileSync(filePath, processedBuffer);
      console.log(`Cleaned & trimmed background -> ${file}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
}

removeBackgrounds();
