import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { TesseractOcrStrategy } from '../src/services/ocr/TesseractOcrStrategy';
import { extractAddressQuery } from '../src/core/addressExtractor';

// process.argv = [chemin de node, chemin de ce script, ...arguments] → les images commencent à l'index 2
const files = process.argv.slice(2);
if (!files.length) {
  console.log('Usage : npx tsx scripts/ocr-test.ts photo1.jpg photo2.png ...');
  process.exit(1);
}

const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.bmp': 'image/bmp' };
const ocr = new TesseractOcrStrategy();

for (const file of files) {
  const mime = MIME[extname(file).toLowerCase()];
  if (!mime) {
    console.warn(`\n[ignoré] ${file} : format non pris en charge (JPG, PNG, WEBP, BMP)`);
    continue;
  }
  try {
    const dataUrl = `data:${mime};base64,${readFileSync(file).toString('base64')}`;
    const start = Date.now();
    const text = await ocr.recognize(dataUrl);
    console.log(`\n===== ${file} (${Date.now() - start} ms) =====`);
    console.log(text);
    console.log('--> Adresse extraite :', extractAddressQuery(text));
  } catch (e) {
    console.error(`\n[erreur] ${file} : ${(e as Error).message}`);
  }
}
process.exit(0);
