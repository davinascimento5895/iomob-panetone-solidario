import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const srcDir = path.join(process.cwd(), 'src', 'assets');
const file = path.join(srcDir, 'hero-panettone.jpg');
if (!fs.existsSync(file)) {
  console.error('Source image not found:', file);
  process.exit(1);
}

const sizes = [480, 768, 1024, 1600];

async function run() {
  for (const size of sizes) {
    const outWebp = path.join(srcDir, `hero-panettone-${size}.webp`);
    const outAvif = path.join(srcDir, `hero-panettone-${size}.avif`);
    await sharp(file)
      .resize({ width: size })
      .webp({ quality: 80 })
      .toFile(outWebp);
    await sharp(file)
      .resize({ width: size })
      .avif({ quality: 50 })
      .toFile(outAvif);
    console.log('Generated', outWebp, outAvif);
  }
  console.log('Done');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
