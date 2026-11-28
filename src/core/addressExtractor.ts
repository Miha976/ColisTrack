const LETTERS = 'A-Za-zÀ-ÖØ-öø-ÿ';
const POSTCODE_CITY = new RegExp(`(?:^|\\s)(\\d{5})\\s+([${LETTERS}][${LETTERS}' -]{1,})`);
const STREET_HINT = new RegExp(
  `\\b(rue|avenue|av|bd|boulevard|chemin|ch|impasse|all[ée]e|place|pl|route|rte|quai|cours|lotissement|lot|` +
    `r[ée]sidence|r[ée]s|square|voie|cit[ée]|hameau|lieu[- ]dit|quartier|village|faubourg|fg|parc|domaine|zone|za|zi|zac)\\b`,
  'i',
);
const STREET_NUMBER = /^\d{1,4}\s*(bis|ter|[a-d])?\b/i;
const PERSON_LINE = /^(m|mr|mme|mlle|mme et m|mr et mme|m et mme|monsieur|madame)\b\.?/i;
const LONG_DIGITS = /\d{7,}/; // codes de suivi, codes-barres

/** Retire les caractères parasites et les fragments de fin de ligne (bords d'étiquette, ombres…). */
function clean(line: string): string {
  let l = line.replace(/[|_~*«»"“”‘’\[\]{}<>]/g, ' ').replace(/\s+/g, ' ').trim();
  // fragments finaux typiques : "k", "ai", "f.", ponctuation isolée
  while (/\s([a-z]{1,2}\.?|[^\sA-Za-zÀ-ÿ0-9]+)$/.test(l)) l = l.replace(/\s\S+$/, '');
  return l.replace(/[.,;:]+$/, '').trim();
}

const isStreet = (l: string) => STREET_HINT.test(l) || STREET_NUMBER.test(l);

/**
 * Extrait la meilleure requête d'adresse à partir d'un texte OCR brut (heuristique française).
 * Toutes les lignes "CP Ville" candidates sont notées ; la plus plausible gagne (à égalité, la plus basse,
 * le destinataire étant en général sous l'expéditeur).
 */
export function extractAddressQuery(raw: string): string | null {
  const lines = raw.split(/\r?\n/).map(clean).filter((l) => l.length > 2);

  let best: { score: number; index: number; cpCity: string } | null = null;
  lines.forEach((line, index) => {
    const m = line.match(POSTCODE_CITY);
    if (!m) return;
    const city = m[2].replace(/\s+\S{0,2}$/, '').trim();
    const before = lines.slice(Math.max(0, index - 2), index);
    let score = 0;
    if (line.startsWith(m[1])) score += 3; // "03700 BELLERIVE…" plutôt que "… 02856 DD 510550"
    if (before.some(isStreet)) score += 3;
    if (city.length >= 3) score += 1;
    if (LONG_DIGITS.test(line)) score -= 4;
    if (/\d/.test(line.slice(line.indexOf(m[2])))) score -= 1; // chiffres après la ville
    if (!best || score >= best.score) best = { score, index, cpCity: `${m[1]} ${city}` };
  });

  if (!best) return lines.find((l) => STREET_HINT.test(l)) ?? null;
  const { index, cpCity } = best as { index: number; cpCity: string };

  for (let i = index - 1; i >= Math.max(0, index - 2); i--) {
    if (isStreet(lines[i]) && !PERSON_LINE.test(lines[i])) return `${lines[i]} ${cpCity}`;
  }
  return cpCity;
}
