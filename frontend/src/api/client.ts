import type { Company, Job } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getJobs(): Promise<Job[]> {
  return getJson<Job[]>("/jobs");
}

export function getCompanies(): Promise<Company[]> {
  return getJson<Company[]>("/companies");
}
