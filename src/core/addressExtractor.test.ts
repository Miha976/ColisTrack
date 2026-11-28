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

  it('retire le bruit devant le type de voie (photo 082749)', () => {
    const ocr = `ZISUBILL5037654246760311212749\nSD : 86650656506176D S62788648933 01838 DD 537901 [I 0000\nMR ET MME XX\nEG 1 N 04%\nBE CITE CLAIR MATIN\n03700 BELLERIVE SUR ALLIER\nus 3699 € | PF,`;
    expect(extractAddressQuery(ocr)).toBe('CITE CLAIR MATIN 03700 BELLERIVE SUR ALLIER');
  });

  it('saute les compléments (APP, BAT, ENTREE) et garde une voie mal lue (photo 082538)', () => {
    const ocr = `D 1/1 50/9/15033/7285 01AB2543893P4ADP 21 DIG '\nSD : 86601919719170\nLA POSTE sos _\nMADAME XX\nAPP 4 ENTREE 1 BAT C MARRONIERS\nP *11E CLAIR MATIN\n03700 BELLERIVE SUR ALLIER`;
    expect(extractAddressQuery(ocr)).toBe('11E CLAIR MATIN 03700 BELLERIVE SUR ALLIER');
  });

  it("ignore l'expéditeur en en-tête et un complément entre voie et CP (photo2)", () => {
    const ocr = `CPAM DE ALLIER\n9 Rue Achille Roche BP 351 03010 MOULINS CEDEX\n2 07.202606\nM XX\nD (CT CLAIR MATIN\nBAT C LES MARRONN APP 4\n03700 BELLERIVE SUR ALLIER\n[ CEAM2259 D3_3.MA*0002947`;
    expect(extractAddressQuery(ocr)).toBe('CT CLAIR MATIN 03700 BELLERIVE SUR ALLIER');
  });

  it('nettoie la ponctuation en début de voie', () => {
    expect(extractAddressQuery(`. 2 CITE CLAIR MATIN\n03700 BELLERIVE SUR ALLIER`)).toBe('2 CITE CLAIR MATIN 03700 BELLERIVE SUR ALLIER');
  });

  it('sans code postal lisible, renvoie au moins la voie (photo 082702)', () => {
    const ocr = `VAT 8\nMme. XXX\nvue va\n. 2 CITE CLAIR MATIN\nEC 25 GGESE AA\nEE] APPARTEMENT 4\nEs BATIMENT C LES MARRONN\n20700\nSE sa`;
    expect(extractAddressQuery(ocr)).toBe('2 CITE CLAIR MATIN');
  });
});
