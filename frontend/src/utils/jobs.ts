import type { Job } from "../types";

export const NO_VERIFIED_JOBS_MESSAGE =
  "No verified jobs yet. Add jobs from official company career pages.";

export function activeJobs(jobs: Job[]): Job[] {
  return jobs.filter((job) => job.is_verified);
}
