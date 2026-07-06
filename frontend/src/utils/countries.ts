// Project-wide country DISPLAY normalization only — see Rule 2 in
// docs/UI_DISPLAY_STANDARD.md. This never touches stored data or importer
// logic; it only changes what's rendered. A value not recognized here is
// shown exactly as stored — never guessed at.
//
// TODO: Rule 2 asks for full ISO 3166-1 alpha-2 coverage (all ~249
// codes), not a hand-picked subset. This table intentionally covers only
// the codes/variants actually observed in imported data plus a broader
// set of common countries, to keep it reviewable and avoid a huge
// generated blob living in source. Replace with a small dependency (e.g.
// `i18n-iso-countries` or `world-countries`) for true full-catalog
// coverage — swap the lookup inside `displayCountry`, keep the function
// signature the same so no call site changes.
const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
  // Codes/variants actually observed coming out of an importer
  il: "Israel",
  pl: "Poland",
  ua: "Ukraine",
  es: "Spain",
  ro: "Romania",
  us: "United States",
  usa: "United States",
  "united states of america": "United States",
  gb: "United Kingdom",
  uk: "United Kingdom",
  korea: "South Korea",
  "korea, republic of": "South Korea",
  "taiwan, province of china": "Taiwan",

  // Broader common-country coverage (ISO 3166-1 alpha-2), so a new
  // importer/company doesn't need a follow-up patch just to render its
  // country correctly
  de: "Germany",
  fr: "France",
  ca: "Canada",
  au: "Australia",
  nz: "New Zealand",
  jp: "Japan",
  cn: "China",
  in: "India",
  br: "Brazil",
  mx: "Mexico",
  ar: "Argentina",
  co: "Colombia",
  cl: "Chile",
  it: "Italy",
  nl: "Netherlands",
  be: "Belgium",
  ch: "Switzerland",
  at: "Austria",
  se: "Sweden",
  no: "Norway",
  dk: "Denmark",
  fi: "Finland",
  ie: "Ireland",
  pt: "Portugal",
  gr: "Greece",
  cz: "Czechia",
  sk: "Slovakia",
  hu: "Hungary",
  bg: "Bulgaria",
  hr: "Croatia",
  si: "Slovenia",
  ee: "Estonia",
  lv: "Latvia",
  lt: "Lithuania",
  ru: "Russia",
  tr: "Turkey",
  sg: "Singapore",
  my: "Malaysia",
  th: "Thailand",
  vn: "Vietnam",
  ph: "Philippines",
  id: "Indonesia",
  tw: "Taiwan",
  hk: "Hong Kong",
  kr: "South Korea",
  ae: "United Arab Emirates",
  sa: "Saudi Arabia",
  za: "South Africa",
  eg: "Egypt",
};

export function displayCountry(country: string | null | undefined): string | null {
  if (!country) return null;
  const trimmed = country.trim();
  if (!trimmed) return null;
  return COUNTRY_DISPLAY_NAMES[trimmed.toLowerCase()] ?? trimmed;
}
