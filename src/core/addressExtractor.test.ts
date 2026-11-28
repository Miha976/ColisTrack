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

  it("renvoie null sans indice d'adresse", () => {
    expect(extractAddressQuery('Fragile\nHaut')).toBeNull();
  });

  it('ignore les codes de suivi et nettoie le bruit (photo réelle, courrier La Poste)', () => {
    const ocr = [
      'SaSN3J3 SIINdH',
      'ATAAN PA TAN',
      'ZRCO18733945260311212749 Es',
      'SD : 86650653030219! S62550498007 02856 DD 510550 [7] 0000 Mic',
      'sure X 1/4 0-50/27/10871/2856 0000 G4 047145 à EN',
      'Pac or LA POSTE =',
      'MR et MME XXXXXXX ',
      'IR ALLIER ETG1N4 ai |',
      '2 CITE CLAIR MATIN k |',
      '03700 BELLERIVE SUR ALLIER f."',
      "vellement de votre offre d'énergie se",
    ].join('\n');
    expect(extractAddressQuery(ocr)).toBe('2 CITE CLAIR MATIN 03700 BELLERIVE SUR ALLIER');
  });

  it("préfère l'adresse du destinataire (plus bas) à celle de l'expéditeur", () => {
    const ocr = `Expéditeur : Shop SAS\n8 rue du Port\n44000 Nantes\n\nDestinataire\nM. Leroy\n3 place Carnot\n21000 Dijon`;
    expect(extractAddressQuery(ocr)).toBe('3 place Carnot 21000 Dijon');
  });

  it('ne prend pas la ligne du nom comme voie', () => {
    expect(extractAddressQuery(`MR et MME DURAND\n03700 BELLERIVE SUR ALLIER`)).toBe('03700 BELLERIVE SUR ALLIER');
  });
});
