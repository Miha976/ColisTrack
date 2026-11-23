/** Patron Strategy : le moteur OCR est interchangeable (Tesseract, ML Kit natif…). */
export interface OcrStrategy {
  recognize(imageDataUrl: string): Promise<string>;
}
