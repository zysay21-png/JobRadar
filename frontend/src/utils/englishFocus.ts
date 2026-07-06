import type { Job } from "../types";

export const SHOWING_ENGLISH_FOCUSED_MESSAGE =
  "Showing English-focused jobs by default. Use “Show all jobs” to view every imported posting.";

// The countries the user actually wants to see by default. Any country not
// in this list (including ones not explicitly called out anywhere, like
// Ireland or Spain) is hidden unless "Show all jobs" is on — this list is a
// strict allowlist, not just a blocklist of the obvious non-English cases.
const TARGET_COUNTRIES = new Set([
  "israel",
  "united states",
  "canada",
  "united kingdom",
  "australia",
  "denmark",
  "sweden",
  "finland",
  "netherlands",
  "germany",
  "france",
  "poland",
]);

// Importers store country in whatever form each source returns (see
// moon_active.py, gunfire_games.py, arenanet.py, playstation.py) — some use
// ISO codes, some use full names, one uses the formal ISO long name. This
// only normalizes strings actually observed in the database; it doesn't
// invent a mapping for codes that haven't shown up.
const COUNTRY_ALIASES: Record<string, string> = {
  usa: "united states",
  us: "united states",
  uk: "united kingdom",
  il: "israel",
  es: "spain",
  pl: "poland",
  ua: "ukraine",
  "taiwan, province of china": "taiwan",
};

function normalizeCountry(country: string): string {
  const lower = country.trim().toLowerCase();
  return COUNTRY_ALIASES[lower] ?? lower;
}

// A job with no country on file at all can't be judged against the target
// list one way or the other. Rather than hiding everything importers never
// attached a country to (a large share of real, verified jobs today), an
// unknown country is treated as passing this check.
function isTargetCountry(country: string | null): boolean {
  if (!country) return true;
  return TARGET_COUNTRIES.has(normalizeCountry(country));
}

// Matches CJK ideographs, Hiragana, Katakana, Hangul, and the full-width
// punctuation Japanese job titles commonly use. Any of these appearing in a
// title is a reliable signal the title isn't English.
const NON_LATIN_SCRIPT = /[　-〿぀-ヿ㐀-䶿一-鿿가-힣＀-￯]/;

// Distinctly French job-title vocabulary seen in real imported data (e.g.
// Rockstar/PlayStation's Montreal postings) that would essentially never
// appear in a genuine English job title.
const FRENCH_WORDS =
  /\b(concepteur|conceptrice|directeur|directrice|gestionnaire|producteur|productrice|programmeur|programmeuse|ing[ée]nieur|d[ée]veloppeur|responsable|coordinateur|coordinatrice|analyste|technicien|technicienne|comptable|juriste|traducteur|r[ée]dacteur|stagiaire|assistante|communaut[ée]|conception)\b/i;

// French job titles that use inclusive/gendered notation like
// "Programmeur·euse" or "Directeur.trice" — the separator plus suffix
// pattern is distinctive even when the base word isn't in FRENCH_WORDS.
const FRENCH_INCLUSIVE_SUFFIX = /[a-z][·.](e|rice|trice|euse|ère)\b/i;

function looksEnglish(title: string): boolean {
  if (NON_LATIN_SCRIPT.test(title)) return false;
  if (FRENCH_INCLUSIVE_SUFFIX.test(title)) return false;
  if (FRENCH_WORDS.test(title)) return false;
  return true;
}

export function isEnglishFocusedJob(job: Job): boolean {
  return isTargetCountry(job.country) && looksEnglish(job.title);
}

export function englishFocusedJobs(jobs: Job[]): Job[] {
  return jobs.filter(isEnglishFocusedJob);
}
