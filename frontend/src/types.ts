export interface Company {
  id: number;
  name: string;
  industry: string | null;
  country: string | null;
  city: string | null;
  platform: string | null;
  engine: string | null;
  website: string | null;
  careers_url: string | null;
  remote: boolean;
  hybrid: boolean;
  onsite: boolean;
  relocation: boolean;
  visa: boolean;
}

export interface Job {
  id: number;
  company_id: number;
  title: string;
  department: string | null;
  country: string | null;
  city: string | null;
  work_model: string | null;
  experience_level: string | null;
  platform: string | null;
  official_url: string | null;
  status: string;
  posted_date: string | null;
  last_checked: string | null;
  notes: string | null;
  source_type: "official" | "manual" | "demo";
  is_verified: boolean;
  company: Company | null;
}

export interface CompanyWithJobs extends Company {
  jobs: Job[];
}

export interface ImporterRunResult {
  companies_checked: number;
  jobs_found: number;
  jobs_added: number;
  jobs_updated: number;
  errors: string[];
}
