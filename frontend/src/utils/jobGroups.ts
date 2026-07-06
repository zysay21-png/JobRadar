import type { Job } from "../types";

export const GENERAL_GROUP = "General";
export const ALL_GROUPS_LABEL = "All Offices/Studios";

type GroupField = "department" | "city";

// Which already-imported field holds genuine studio/office information for
// a given company. This can't be inferred generically — "department" means
// different things per importer (see backend/app/importers/*.py):
//   - Sony Interactive Entertainment (playstation.py): department is the
//     source's brandName, i.e. the actual studio (Naughty Dog, Insomniac,
//     Bungie, generic "Sony Interactive Entertainment LLC (SIE)", etc.).
//   - Rockstar Games (rockstar_games.py): city holds the studio name
//     (Rockstar North, Rockstar Toronto, ...) since Rockstar's source has
//     no separate city field; department there is a functional team
//     (Code, Art, Security) and would be a wrong "studio" grouping.
//   - Moon Active (moon_active.py): city is a real office city (Tel Aviv,
//     Warsaw, Kyiv, Barcelona) sourced directly from Comeet's location data.
//   - Electronic Arts (electronic_arts.py): department is EA's own
//     "Studio/Department" field, which already distinguishes real studios
//     (e.g. "EA Studios - Respawn", "EA Studios - Criterion Games", "EA
//     Studios - DICE Stockholm", "Maxis") from corporate functions (e.g.
//     "Marketing", "CT - IT", "Finance") via EA's own naming convention.
// Verified against the current database for every company with imported
// jobs before adding an entry here — ArenaNet, Gunfire Games, and Krafton
// were deliberately left out because none of their fields represent
// distinct studios/offices (single office, or only functional departments),
// so they fall back to "General" and get no picker, per requirement.
const COMPANY_GROUP_FIELD: Record<string, GroupField> = {
  "Sony Interactive Entertainment": "department",
  "Rockstar Games": "city",
  "Moon Active": "city",
  "Electronic Arts": "department",
};

function groupValueOf(job: Job, field: GroupField): string {
  const raw = field === "department" ? job.department : job.city;
  return raw?.trim() || GENERAL_GROUP;
}

export interface JobGroup {
  name: string;
  count: number;
}

// Returns [] when the company has no known studio/office field, or when
// every job resolves to the same single group — in both cases a picker
// wouldn't add anything to filter.
export function groupJobs(jobs: Job[], companyName: string): JobGroup[] {
  const field = COMPANY_GROUP_FIELD[companyName];
  if (!field) return [];

  const counts = new Map<string, number>();
  for (const job of jobs) {
    const key = groupValueOf(job, field);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  if (counts.size < 2) return [];

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function filterByGroup(jobs: Job[], companyName: string, group: string | null): Job[] {
  const field = COMPANY_GROUP_FIELD[companyName];
  if (!field || !group) return jobs;
  return jobs.filter((job) => groupValueOf(job, field) === group);
}
