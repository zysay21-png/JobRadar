import { Link, useParams } from "react-router-dom";
import { getCompanies, getJobs } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import JobCard from "../components/JobCard";
import { activeJobs, NO_VERIFIED_JOBS_MESSAGE } from "../utils/jobs";

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = Number(companyId);

  const { data: companies, loading: companiesLoading, error: companiesError } =
    useApiData(getCompanies);
  const { data: jobs, loading: jobsLoading, error: jobsError } = useApiData(getJobs);

  const loading = companiesLoading || jobsLoading;
  const error = companiesError ?? jobsError;
  const company = companies?.find((c) => c.id === id);
  const companyJobs = activeJobs(jobs?.filter((job) => job.company_id === id) ?? []);

  if (loading) {
    return (
      <div className="page">
        <p className="state-message">Loading company...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <p className="state-message state-error">Failed to load company: {error}</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="page">
        <p className="state-message">Company not found.</p>
        <Link to="/companies" className="section-link">
          &larr; Back to companies
        </Link>
      </div>
    );
  }

  const location = [company.city, company.country].filter(Boolean).join(", ");

  return (
    <div className="page">
      <Link to="/companies" className="section-link">
        &larr; Back to companies
      </Link>

      <section className="company-detail-header">
        <h1>{company.name}</h1>
        <div className="tag-row">
          {company.platform && <span className="tag">{company.platform}</span>}
          {company.engine && <span className="tag">{company.engine}</span>}
          {company.remote && <span className="tag">Remote</span>}
          {company.hybrid && <span className="tag">Hybrid</span>}
          {company.onsite && <span className="tag">Onsite</span>}
        </div>
        <div className="card-meta">
          {location && <span>{location}</span>}
          {company.relocation && <span>Relocation support</span>}
          {company.visa && <span>Visa sponsorship</span>}
        </div>
        {company.careers_url && (
          <a
            className="card-link"
            href={company.careers_url}
            target="_blank"
            rel="noreferrer"
          >
            Careers page &rarr;
          </a>
        )}
      </section>

      <section>
        <div className="section-header">
          <h2>Open positions</h2>
        </div>
        {companyJobs.length === 0 && (
          <p className="state-message">{NO_VERIFIED_JOBS_MESSAGE}</p>
        )}
        <div className="card-grid">
          {companyJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
