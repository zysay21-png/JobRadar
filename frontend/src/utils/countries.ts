// Project-wide country DISPLAY normalization only — see Rule 10 (Preserve
// Official Data) in docs/COMPANY_ONBOARDING_STANDARD.md. This never
// touches stored data or importer logic; it only changes what's rendered.
// Only maps codes/variants actually observed coming out of an importer
// (Moon Active/SuperPlay's Comeet ISO codes, Riot/EA's "USA" / "United
// States of America", Sony's ISO long-form names), plus the standard
// 2-letter codes any future importer could plausibly return. A value not
// recognized here is shown exactly as stored — never guessed at.
const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
  il: "Israel",
  pl: "Poland",
  ua: "Ukraine",
  es: "Spain",
  de: "Germany",
  fr: "France",
  ca: "Canada",
  ro: "Romania",
  us: "United States",
  usa: "United States",
  "united states of america": "United States",
  gb: "United Kingdom",
  uk: "United Kingdom",
  korea: "South Korea",
  "korea, republic of": "South Korea",
  "taiwan, province of china": "Taiwan",
};

export function displayCountry(country: string | null | undefined): string | null {
  if (!country) return null;
  const trimmed = country.trim();
  if (!trimmed) return null;
  return COUNTRY_DISPLAY_NAMES[trimmed.toLowerCase()] ?? trimmed;
}
