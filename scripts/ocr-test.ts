import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { TesseractOcrStrategy } from '../src/services/ocr/TesseractOcrStrategy';
import { extractAddressQuery } from '../src/core/addressExtractor';

const files = process.argv.slice(2);
if (!files.length) {
  console.log('Usage : npx tsx scripts/ocr-test.ts photo1.jpg photo2.png ...');
  process.exit(1);
}

const ocr = new TesseractOcrStrategy();

for (const file of files) {
  const mime = extname(file).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  const dataUrl = `data:${mime};base64,${readFileSync(file).toString('base64')}`;
  const start = Date.now();
  const text = await ocr.recognize(dataUrl);
  console.log(`\n===== ${file} (${Date.now() - start} ms) =====`);
  console.log(text);
  console.log('--> Adresse extraite :', extractAddressQuery(text));
}
process.exit(0);
