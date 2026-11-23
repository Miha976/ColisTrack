import type { Worker } from 'tesseract.js';
import type { OcrStrategy } from './OcrService';

export class TesseractOcrStrategy implements OcrStrategy {
  private worker: Promise<Worker> | null = null;

  /** Chargement paresseux : le moteur (~2 Mo) n'est téléchargé qu'au premier scan. */
  private getWorker(): Promise<Worker> {
    this.worker ??= import('tesseract.js').then(({ createWorker }) => createWorker('fra'));
    return this.worker;
  }

  async recognize(imageDataUrl: string): Promise<string> {
    const worker = await this.getWorker();
    const { data } = await worker.recognize(imageDataUrl);
    return data.text;
  }
}
