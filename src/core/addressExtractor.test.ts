import { describe, expect, it } from 'vitest';
import { extractAddressQuery } from './addressExtractor';

describe('extractAddressQuery', () => {
  it('trouve voie + CP ville sur une étiquette', () => {
    const ocr = `COLISSIMO\nM. DUPONT Jean\n12 rue des Lilas\n75012 PARIS\nFRANCE`;
    expect(extractAddressQuery(ocr)).toBe('12 rue des Lilas 75012 PARIS');
  });
  it('gère une ligne complémentaire entre voie et CP', () => {
    const ocr = `Mme Martin\n4 bis avenue Foch\nBat. C\n69006 Lyon`;
    expect(extractAddressQuery(ocr)).toBe('4 bis avenue Foch 69006 Lyon');
  });
  it('renvoie null sans indice d\'adresse', () => {
    expect(extractAddressQuery('Fragile\nHaut')).toBeNull();
  });
});
