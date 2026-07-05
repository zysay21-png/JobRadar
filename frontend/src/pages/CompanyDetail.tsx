import { Link, useParams } from "react-router-dom";
import { getCompany } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import JobCard from "../components/JobCard";
import { activeJobs } from "../utils/jobs";

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = Number(companyId);

  const { data: company, loading, error } = useApiData(() => getCompany(id));
  const companyJobs = activeJobs(company?.jobs ?? []);

  if (loading) {
    return (
      <div className="page">
        <p className="state-message">Loading company...</p>
      </div>
    );
  }

  if (error || !company) {
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
          {company.industry && <span className="tag">{company.industry}</span>}
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
        <div className="card-actions company-detail-actions">
          {company.website && (
            <a
              className="btn btn-secondary"
              href={company.website}
              target="_blank"
              rel="noreferrer"
            >
              Official Website
            </a>
          )}
          {company.careers_url && (
            <a
              className="btn btn-primary"
              href={company.careers_url}
              target="_blank"
              rel="noreferrer"
            >
              Official Careers Page &rarr;
            </a>
          )}
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>Open Jobs</h2>
        </div>
        {companyJobs.length === 0 && (
          <p className="state-message">No verified jobs yet.</p>
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
