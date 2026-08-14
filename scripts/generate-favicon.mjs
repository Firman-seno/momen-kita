import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logoPath = path.join(__dirname, '..', 'public', 'logo-momenkita-2.png');

// The logo has a dark (near-black) outer frame, so pad with black for a seamless,
// non-stretched favicon that keeps the entire design intact.
const BACKGROUND = { r: 0, g: 0, b: 0, alpha: 1 };

const targets = [
  { name: 'favicon.png', size: 64 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function main() {
  const logo = sharp(logoPath);
  const meta = await logo.metadata();
  console.log(`Source logo: ${meta.width}x${meta.height} (${meta.format}, ${Math.round((meta.width * meta.height) / 1024 / 1024)}MB)`);

  for (const t of targets) {
    const out = path.join(__dirname, '..', 'public', t.name);
    await sharp(logoPath)
      .resize(t.size, t.size, {
        fit: 'contain',
        position: 'centre',
        withoutEnlargement: true,
        background: BACKGROUND,
      })
      .png()
      .toFile(out);
    console.log(`Wrote ${t.name} (${t.size}x${t.size})`);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
