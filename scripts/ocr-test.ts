import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TesseractOcrStrategy } from '../src/services/ocr/TesseractOcrStrategy';
import { extractAddressQuery } from '../src/core/addressExtractor';

const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.bmp': 'image/bmp' };
const DEFAULT_DIR = join(dirname(fileURLToPath(import.meta.url)), 'photos');

/** Développe les dossiers en la liste de leurs images (triées par nom). */
function collect(paths: string[]): string[] {
  return paths.flatMap((p) => {
    if (!existsSync(p)) {
      console.warn(`[introuvable] ${p}`);
      return [];
    }
    return statSync(p).isDirectory()
      ? readdirSync(p)
          .filter((f) => MIME[extname(f).toLowerCase()])
          .sort()
          .map((f) => join(p, f))
      : [p];
  });
}

// process.argv = [node, ce script, ...arguments]. Sans argument : toutes les images de scripts/photos
const args = process.argv.slice(2);
const files = collect(args.length ? args : [DEFAULT_DIR]);
if (!files.length) {
  console.log(`Aucune image trouvée. Mettez vos photos dans ${DEFAULT_DIR} ou passez des fichiers/dossiers en argument.`);
  process.exit(1);
}
console.log(`${files.length} image(s) à analyser…`);

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
