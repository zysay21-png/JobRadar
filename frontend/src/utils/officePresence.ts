import type { Job } from "../types";
import { formatLocation, isRealOfficeCity } from "./location";

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
