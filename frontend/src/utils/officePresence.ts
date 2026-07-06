import type { Job } from "../types";
import { formatLocation } from "./location";

// Some sources put a work-arrangement descriptor in the city field instead
// of a real place (confirmed case: ArenaNet's city is literally "Remote" /
// "Remote or Hybrid", not an office name). Checked against the raw city
// value directly — before it's combined with a country into a display
// string — so this catches the descriptor regardless of whether a country
// happens to be attached to that particular job. These must not count as
// distinct offices, or a single-office company posting only remote roles
// would be wrongly reported as multi-office.
const NON_OFFICE_CITY_VALUES = new Set(["remote", "remote or hybrid", "hybrid", "onsite", "on-site"]);

function isRealOfficeCity(city: string | null | undefined): boolean {
  const trimmed = city?.trim().toLowerCase();
  return !trimmed || !NON_OFFICE_CITY_VALUES.has(trimmed);
}

// Companies whose jobs span 2+ distinct real office locations — used on
// the Companies page to show "Multiple Studios" instead of a single
// headquarters address that would otherwise imply development is limited
// to one place. A job whose own location is the source's "Multiple
// Locations" placeholder is treated as immediate proof on its own, since
// that single posting already spans more than one office.
export function companiesWithMultipleOffices(jobs: Job[]): Set<number> {
  const result = new Set<number>();
  const locationsByCompany = new Map<number, Set<string>>();

  for (const job of jobs) {
    if (!isRealOfficeCity(job.city)) continue;

    const location = formatLocation(job.city, job.country);
    if (!location) continue;

    if (location === "Multiple Locations") {
      result.add(job.company_id);
      continue;
    }

    const locations = locationsByCompany.get(job.company_id) ?? new Set<string>();
    locations.add(location);
    locationsByCompany.set(job.company_id, locations);
  }

  for (const [companyId, locations] of locationsByCompany) {
    if (locations.size >= 2) result.add(companyId);
  }

  return result;
}
