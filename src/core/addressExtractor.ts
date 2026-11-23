const POSTCODE_CITY = /\b(\d{5})\s+([A-ZÀ-Ÿa-zà-ÿ' -]{2,})/;
const STREET_HINT = /\b(\d{1,4}\s*(bis|ter)?\s*,?\s*)?(rue|avenue|av\.?|bd|boulevard|chemin|ch\.?|impasse|all[ée]e|place|route|rte|quai|cours|lotissement|lot\.?|r[ée]sidence|square|voie)\b/i;

/**
 * Extrait la meilleure requête d'adresse à partir d'un texte OCR brut.
 * Heuristique française : on cherche la ligne "CP Ville" et la ligne de voie qui la précède.
 */
export function extractAddressQuery(raw: string): string | null {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/[|_~*«»]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 2);

  const cpIndex = lines.findIndex((l) => POSTCODE_CITY.test(l));
  if (cpIndex === -1) {
    const street = lines.find((l) => STREET_HINT.test(l));
    return street ?? null;
  }

  const cpLine = lines[cpIndex].match(POSTCODE_CITY)!;
  const cpCity = `${cpLine[1]} ${cpLine[2].trim()}`;

  // La voie est généralement sur l'une des 2 lignes précédentes
  for (let i = cpIndex - 1; i >= Math.max(0, cpIndex - 2); i--) {
    if (STREET_HINT.test(lines[i]) || /^\d{1,4}\s/.test(lines[i])) return `${lines[i]} ${cpCity}`;
  }
  return cpIndex > 0 ? `${lines[cpIndex - 1]} ${cpCity}` : cpCity;
}
