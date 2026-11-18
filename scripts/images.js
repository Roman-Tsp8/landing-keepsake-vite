// npm run images
// images-src/*.{jpg,jpeg,png} -> src/assets/images/<name>-<width>.{avif,webp,jpg}
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import sharp from 'sharp';

const SRC = 'images-src';
const OUT = 'src/assets/images';
const WIDTHS = [400, 800, 1200];
const QUALITY = { avif: 55, webp: 78, jpg: 80 };

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));

if (files.length === 0) {
  console.error(`У ${SRC}/ немає зображень (jpg/png).`);
  process.exit(1);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let before = 0;
let after = 0;

for (const file of files) {
  const name = basename(file, extname(file));
  const input = `${SRC}/${file}`;
  before += (await stat(input)).size;

  for (const width of WIDTHS) {
    const image = sharp(input).resize({ width, withoutEnlargement: true });
    const base = `${OUT}/${name}-${width}`;

    await image.clone().avif({ quality: QUALITY.avif }).toFile(`${base}.avif`);
    await image.clone().webp({ quality: QUALITY.webp }).toFile(`${base}.webp`);
    await image.clone().jpeg({ quality: QUALITY.jpg, mozjpeg: true }).toFile(`${base}.jpg`);

    for (const ext of ['avif', 'webp', 'jpg']) {
      after += (await stat(`${base}.${ext}`)).size;
    }
  }
  console.log(`✔ ${name}`);
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
console.log(`\nВихідні: ${kb(before)} (${files.length} файлів)`);
console.log(`Згенеровано: ${kb(after)} (${files.length * WIDTHS.length * 3} файлів)`);
