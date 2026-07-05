import type { Job } from "../types";

export const NO_VERIFIED_JOBS_MESSAGE =
  "No verified jobs yet. Add jobs from official company career pages.";

export const NO_DETAILS_MESSAGE = "Open official posting to view full details.";

export function activeJobs(jobs: Job[]): Job[] {
  return jobs.filter((job) => job.is_verified);
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
