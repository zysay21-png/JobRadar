import type { Job } from "../types";

export const NO_VERIFIED_JOBS_MESSAGE =
  "No verified jobs yet. Add jobs from official company career pages.";

export const NO_DETAILS_MESSAGE = "Open official posting to view full details.";

export const NO_NEW_JOBS_MESSAGE = "No new jobs since your last check.";

export function activeJobs(jobs: Job[]): Job[] {
  return jobs.filter((job) => job.is_verified);
}

// A job is "new since last check" if it was first discovered during the
// most recently completed importer run — i.e. its first_seen exactly
// matches that run's timestamp (see backend run_importers.run_all).
export function isNewJob(job: Job, lastRefreshAt: string | null): boolean {
  if (!job.first_seen || !lastRefreshAt) return false;
  const firstSeen = new Date(job.first_seen).getTime();
  const refreshedAt = new Date(lastRefreshAt).getTime();
  if (Number.isNaN(firstSeen) || Number.isNaN(refreshedAt)) return false;
  return firstSeen === refreshedAt;
}

export function formatJobDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
