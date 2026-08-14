import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '..', 'public', 'music', 'logo-momenkita.png');
const outPath = path.join(__dirname, '..', 'public', 'og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;

async function main() {
  const logo = sharp(logoPath);
  const meta = await logo.metadata();
  console.log('Logo metadata:', meta.width, 'x', meta.height, 'format:', meta.format, 'channels:', meta.channels);

  // Determine logo width on canvas (keep aspect ratio, max ~480 wide on a 630-tall canvas)
  const logoW = 480;
  const logoH = Math.round((logoW * (meta.height || 1086)) / (meta.width || 1448));

  // Compose logo onto a deep-navy background (#14213D = brand primary)
  const composite = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 20, g: 33, b: 61, alpha: 1 }, // #14213D
    },
  })
    .composite([
      {
        input: await logo.resize(logoW, undefined, { withoutEnlargement: false }).toBuffer(),
        left: Math.round((WIDTH - logoW) / 2),
        top: Math.round((HEIGHT - logoH) / 2 - 20),
      },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(outPath, composite);
  console.log('OG image written to', outPath, 'size:', composite.length, 'bytes');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
