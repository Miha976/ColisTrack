const LETTERS = 'A-Za-zÀ-ÖØ-öø-ÿ';
const POSTCODE_CITY = new RegExp(`(?:^|\\s)(\\d{5})\\s+([${LETTERS}][${LETTERS}' -]{1,})`);
const STREET_HINT = new RegExp(
  `\\b(rue|avenue|av|bd|boulevard|chemin|ch|impasse|all[ée]e|place|pl|route|rte|quai|cours|lotissement|lot|` +
    `r[ée]sidence|r[ée]s|square|voie|cit[ée]|hameau|lieu[- ]dit|quartier|village|faubourg|fg|parc|domaine|zone|za|zi|zac)\\b`,
  'i',
);
const STREET_NUMBER = new RegExp(`^\\d{1,4}\\s*(bis|ter|[a-d])?\\s+[${LETTERS}]{2,}`, 'i'); // "12 rue…", pas "2 07.2026"
const PERSON_LINE = /^(m|mr|mme|mlle|mme et m|mr et mme|m et mme|monsieur|madame)\b\.?/i;
const LONG_DIGITS = /\d{7,}/; // codes de suivi, codes-barres
/** Compléments d'adresse : utiles au facteur, nuisibles au géocodage. */
const COMPLEMENT_LINE = /^(app|appt|appartement|apt|bat|b[aâ]t|b[aâ]timent|entr[ée]e|etg|[ée]tage|esc|escalier|porte|bp|cs|cedex)\b/i;

/** Retire les caractères parasites et les fragments de fin de ligne (bords d'étiquette, ombres…). */
function clean(line: string): string {
  let l = line.replace(/[|_~*«»"“”‘’\[\](){}<>]/g, ' ').replace(/\s+/g, ' ').trim();
  // fragments finaux typiques : "k", "ai", "f.", ponctuation isolée
  while (/\s([a-z]{1,2}\.?|[^\sA-Za-zÀ-ÿ0-9]+)$/.test(l)) l = l.replace(/\s\S+$/, '');
  // ponctuation initiale (". 2 CITE…")
  l = l.replace(/^([^\sA-Za-zÀ-ÿ0-9]+\s*)+/, '');
  return l.replace(/[.,;:]+$/, '').trim();
}

/** Nettoie une ligne de voie : lettre isolée en tête ("P 11E CLAIR…") et bruit avant le type de voie. */
function cleanStreet(line: string): string {
  while (/^[A-Za-zÀ-ÿ]\s+\S/.test(line)) line = line.replace(/^\S+\s+/, '');
  const m = line.match(STREET_HINT);
  if (!m || m.index === undefined || m.index === 0) return line;
  const prefix = line.slice(0, m.index);
  return /^\d{1,4}\s*(bis|ter|[a-d])?\s*,?\s*$/i.test(prefix) ? line : line.slice(m.index);
}

/** Ligne plausible de voie sans mot-clé reconnu (OCR abîmé : "11E CLAIR MATIN") : au moins 2 mots de 3 lettres. */
const looksLikeStreet = (l: string) =>
  !COMPLEMENT_LINE.test(l) && !LONG_DIGITS.test(l) &&
  (l.match(new RegExp(`[${LETTERS}]{3,}`, 'g')) ?? []).length >= 2;

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

  if (!best) {
    const street = lines.find((l) => STREET_HINT.test(l));
    return street ? cleanStreet(street) : null;
  }
  const { index, cpCity } = best as { index: number; cpCity: string };

  // Lignes au-dessus du CP, de la plus proche à la plus lointaine, sans remonter au-delà du nom du destinataire
  const above: string[] = [];
  for (let i = index - 1; i >= Math.max(0, index - 3) && !PERSON_LINE.test(lines[i]); i--) above.push(lines[i]);

  const street =
    above.find((l) => isStreet(l) && !COMPLEMENT_LINE.test(l)) ?? // type de voie ou numéro reconnu
    above.find(looksLikeStreet); // repli : voie mal lue ("11E CLAIR MATIN")
  return street ? `${cleanStreet(street)} ${cpCity}` : cpCity;
}
