// Cuts a tall screenshot into viewable slices: node scripts/slice.mjs <png> <sliceHeight>
import sharp from 'sharp';
const [file, hArg = '1500'] = process.argv.slice(2);
const h = Number(hArg);
const img = sharp(file);
const { width, height } = await img.metadata();
for (let i = 0, y = 0; y < height; i++, y += h) {
  const out = file.replace('.png', `.s${i}.jpg`);
  await sharp(file).extract({ left: 0, top: y, width, height: Math.min(h, height - y) }).jpeg({ quality: 80 }).toFile(out);
  console.log(out);
}
