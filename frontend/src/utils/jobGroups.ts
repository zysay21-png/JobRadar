import type { Job } from "../types";
import { displayCountry } from "./countries";

export const GENERAL_GROUP = "General";
export const ALL_STUDIOS_LABEL = "All Studios";
export const ALL_DEPARTMENTS_LABEL = "All Departments";
export const ALL_LOCATIONS_LABEL = "All Locations";

export interface JobGroup {
  name: string;
  count: number;
}

type RawField = "department" | "city" | "country";

interface FacetSource {
  field: RawField;
  // Mixed-field split: some companies' single `department` field mixes real
  // studio/brand names with plain corporate departments in the same string
  // (see the company notes below for how each set was verified). `only`
  // restricts a facet to exactly these values; `exclude` is the
  // complementary facet for the same field, everything NOT in the sibling's
  // `only` set. A field with neither is used in full, as-is.
  only?: Set<string>;
  exclude?: Set<string>;
}

interface CompanyFacetConfig {
  studio?: FacetSource;
  department?: FacetSource;
  location?: FacetSource;
}

// Zynga (Greenhouse `departments[0].name`): confirmed via Greenhouse's own
// per-job `metadata` "Company" field (e.g. "Social Point, S.L.",
// "Gram Games Limited UK", "NaturalMotion Games Limited") that these
// department values really are separate acquired-studio legal entities,
// not a guess. Everything else on Zynga's board is a plain corporate
// department (Analytics, Corporate, Operations, ...).
const ZYNGA_STUDIO_VALUES = new Set([
  "Gram Games",
  "NaturalMotion",
  "Small Giant Games",
  "Socialpoint",
  "Studio I",
  "Studios",
  "Trinity",
  "Zynga Studio One",
]);

// Playtika (Greenhouse `departments[0].name`): these four codes were
// confirmed against Playtika's own public games list
// (playtika.com/games/) — HOF = House of Fun, WSOP = World Series of
// Poker, SGH = Solitaire Grand Harvest, SM = Slotomania, all real Playtika
// titles. "BX" was deliberately left classified as a department, not a
// studio, because it could not be confirmed against any real Playtika
// brand — accuracy over completeness.
const PLAYTIKA_STUDIO_VALUES = new Set(["HOF", "WSOP", "SGH", "SM"]);

// Electronic Arts (Greenhouse `departments[0].name`): every value prefixed
// "EA Studios -", "EA Sports -", or "EA Mobile -" is EA's own naming
// convention for a specific studio (Respawn, Criterion Games, DICE
// Stockholm, Motive Montreal, BioWare, Ripple Effect, Codemasters,
// Firemonkeys, Playdemic, ...). "Maxis" is EA's own well-known studio
// (The Sims, SimCity) and is included even though EA's board doesn't
// prefix it. Everything else (Marketing, Finance, CT - IT, People
// Experience & Workplaces, ...) is a plain corporate function.
const EA_STUDIO_VALUES = new Set([
  "EA Studios - BioWare",
  "EA Studios - Criterion Games",
  "EA Studios - DICE Stockholm",
  "EA Studios - EA Create",
  "EA Studios - Full Circle",
  "EA Studios - Localization",
  "EA Studios - Mobile Korea",
  "EA Studios - Motive Montreal",
  "EA Studios - Quality Verification",
  "EA Studios - Respawn",
  "EA Studios - Ripple Effect",
  "EA Studios - SPORTS",
  "EA Sports - Codemasters",
  "EA Sports - Tracab",
  "EA Mobile - Firemonkeys",
  "EA Mobile - Playdemic",
  "EA Mobile - TRACK20 (Helsinki)",
  "Maxis",
]);

// Which facets apply to each company, and which already-imported field
// backs each one. Verified against the real database for every company
// with imported jobs before adding an entry — see
// backend/app/importers/README.md and docs/COMPANY_ONBOARDING_STANDARD.md
// for the research behind each one. Companies not listed here (ArenaNet's
// city is "Remote"/"Remote or Hybrid", not a real office; Gunfire Games,
// Krafton, HoYoverse have only one office/department or no jobs) simply
// get whichever facets are listed, or none.
const COMPANY_FACETS: Record<string, CompanyFacetConfig> = {
  "Rockstar Games": {
    // city holds the studio name (Rockstar North, Rockstar Toronto, ...)
    // since Rockstar's source has no separate city field; department is a
    // real functional team (Code, Art, Security).
    studio: { field: "city" },
    department: { field: "department" },
  },
  "Sony Interactive Entertainment": {
    // department is the source's brandName — the actual studio (Naughty
    // Dog, Insomniac, Bungie, generic "Sony Interactive Entertainment LLC
    // (SIE)", etc.). No separate functional-department field is captured.
    studio: { field: "department" },
    location: { field: "country" },
  },
  "Riot Games": {
    // department is Riot's own "products" field — the game/product team a
    // role supports (VALORANT, League of Legends, Riftbound, Esports).
    studio: { field: "department" },
    location: { field: "country" },
  },
  "Electronic Arts": {
    studio: { field: "department", only: EA_STUDIO_VALUES },
    department: { field: "department", exclude: EA_STUDIO_VALUES },
    location: { field: "country" },
  },
  "Moon Active": {
    // city is a real office city (Tel Aviv, Warsaw, Kyiv, Barcelona) and
    // department is a genuine functional team (Art & Design, R&D,
    // Marketing, ...) — both real, both from separate fields, no overlap.
    studio: { field: "city" },
    department: { field: "department" },
  },
  SuperPlay: {
    // Same Comeet-sourced shape as Moon Active (Tel Aviv-Yafo, Warsaw,
    // Bucharest offices; Art & Design, R&D, Marketing, ... departments).
    studio: { field: "city" },
    department: { field: "department" },
  },
  ArenaNet: {
    // department is real (Art, Design, Localization, Platform); city is
    // just "Remote" / "Remote or Hybrid", not a real office, so no studio
    // facet here.
    department: { field: "department" },
  },
  Zynga: {
    // No location facet here even though these studio names (Gram Games,
    // NaturalMotion, ...) are brand names, not offices: Zynga's `city`
    // field is the only location data available, and it's dominated by
    // compound multi-office strings (e.g. "Austin, TX; Bay Area, CA;
    // Chicago, IL; Toronto, Canada" as one raw value) — a facet built on
    // it would show clutter, not clean navigation. Verified against the
    // real data, not assumed.
    studio: { field: "department", only: ZYNGA_STUDIO_VALUES },
    department: { field: "department", exclude: ZYNGA_STUDIO_VALUES },
  },
  Playtika: {
    // Studio here is a game-brand code (HOF, WSOP, SGH, SM) — it carries
    // no geographic meaning at all, unlike Rockstar's city-derived studio
    // names. Location filters group by country only (see rawFieldValue),
    // but Playtika's `country` field is empty on every job — its real
    // location data lives in `city` instead (Herzliya, Bucharest, Warsaw,
    // Kyiv, plus a few bare country names). city isn't a valid source for
    // a *filter* here (mixing city- and country-granularity values in one
    // facet would misrepresent the grouping), so no Location filter shows
    // for Playtika rather than one built on the wrong field. That data
    // still reaches the user on each job card via formatJobLocation.
    studio: { field: "department", only: PLAYTIKA_STUDIO_VALUES },
    department: { field: "department", exclude: PLAYTIKA_STUDIO_VALUES },
    location: { field: "country" },
  },
  "Epic Games": {
    // No studio-level breakdown exists on Epic's Greenhouse board — every
    // department value (Engineering Generalist, Art, Production, ...) is
    // a plain functional department.
    department: { field: "department" },
  },
};

function rawFieldValue(job: Job, field: RawField): string | null {
  if (field === "department") return job.department;
  // Some sources (Playtika) store a bare country name directly in `city`
  // for a handful of jobs alongside real city names. Running city values
  // through the same normalizer used for the country field is a safe
  // no-op for genuine city/studio names (they're never in the country
  // map) but merges "USA" into "United States" wherever it does apply —
  // the same fix already applied to job cards in utils/location.ts.
  if (field === "city") return displayCountry(job.city);
  // Location grouping/filtering uses the normalized display name (see
  // Rule 10 in docs/COMPANY_ONBOARDING_STANDARD.md) so equivalent raw
  // variants (e.g. "USA" vs "United States of America") merge into one
  // group instead of splitting the same country across two pills.
  return displayCountry(job.country);
}

// The real value for this job under this facet, or null if the job simply
// doesn't participate in this facet at all (no data, or claimed by a
// sibling facet via only/exclude). Used both for grouping and for a single
// job's studio/department badge.
function resolvedFacetValue(job: Job, source?: FacetSource): string | null {
  if (!source) return null;
  const raw = rawFieldValue(job, source.field)?.trim();
  if (!raw) return null;
  if (source.only && !source.only.has(raw)) return null;
  if (source.exclude && source.exclude.has(raw)) return null;
  return raw;
}

function computeGroups(jobs: Job[], source?: FacetSource): JobGroup[] {
  if (!source) return [];

  const counts = new Map<string, number>();
  for (const job of jobs) {
    const raw = rawFieldValue(job, source.field)?.trim();

    if (source.only) {
      // An "only" facet (e.g. studio, split out of a mixed field) only
      // ever shows jobs that genuinely match — no General bucket, since a
      // non-matching job belongs to a sibling facet, not to "no studio".
      if (!raw || !source.only.has(raw)) continue;
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
      continue;
    }

    if (source.exclude && raw && source.exclude.has(raw)) continue;

    const key = raw || GENERAL_GROUP;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  if (counts.size < 2) return [];

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function matchesFacet(job: Job, source: FacetSource | undefined, selected: string | null): boolean {
  if (!source || !selected) return true;
  const raw = rawFieldValue(job, source.field)?.trim();

  if (source.only) {
    return !!raw && source.only.has(raw) && raw === selected;
  }
  if (source.exclude && raw && source.exclude.has(raw)) return false;

  const key = raw || GENERAL_GROUP;
  return key === selected;
}

export interface CompanyFacetGroups {
  studio: JobGroup[];
  department: JobGroup[];
  location: JobGroup[];
}

export function computeFacetGroups(jobs: Job[], companyName: string): CompanyFacetGroups {
  const config = COMPANY_FACETS[companyName];
  return {
    studio: computeGroups(jobs, config?.studio),
    department: computeGroups(jobs, config?.department),
    location: computeGroups(jobs, config?.location),
  };
}

export interface FacetSelection {
  studio: string | null;
  department: string | null;
  location: string | null;
}

export const EMPTY_SELECTION: FacetSelection = { studio: null, department: null, location: null };

export function filterByFacets(jobs: Job[], companyName: string, selection: FacetSelection): Job[] {
  const config = COMPANY_FACETS[companyName];
  return jobs.filter(
    (job) =>
      matchesFacet(job, config?.studio, selection.studio) &&
      matchesFacet(job, config?.department, selection.department) &&
      matchesFacet(job, config?.location, selection.location)
  );
}

// For a single job's card: its studio/brand label and department/team
// label, if this company has that facet and this job genuinely has a
// value for it. Never returns the "General" fallback — a job card either
// shows a real value or omits the line entirely.
export function jobStudioLabel(job: Job, companyName: string): string | null {
  return resolvedFacetValue(job, COMPANY_FACETS[companyName]?.studio);
}

export function jobDepartmentLabel(job: Job, companyName: string): string | null {
  return resolvedFacetValue(job, COMPANY_FACETS[companyName]?.department);
}

// True when this company's studio facet is sourced from `city` — used so
// the plain city/country location line on a job card doesn't repeat the
// exact same value already shown as the studio badge (e.g. Rockstar's
// "Rockstar North" would otherwise appear twice).
export function studioUsesCityField(companyName: string): boolean {
  return COMPANY_FACETS[companyName]?.studio?.field === "city";
}
