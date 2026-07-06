import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCompany } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import JobCard from "../components/JobCard";
import ShowAllJobsToggle from "../components/ShowAllJobsToggle";
import { activeJobs } from "../utils/jobs";
import { englishFocusedJobs } from "../utils/englishFocus";
import { ALL_GROUPS_LABEL, filterByGroup, groupJobs } from "../utils/jobGroups";

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = Number(companyId);
  const [showAll, setShowAll] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const { data: company, loading, error } = useApiData(() => getCompany(id));
  const verifiedJobs = activeJobs(company?.jobs ?? []);
  const companyJobs = showAll ? verifiedJobs : englishFocusedJobs(verifiedJobs);
  const jobGroups = groupJobs(companyJobs, company?.name ?? "");
  const visibleJobs = filterByGroup(companyJobs, company?.name ?? "", selectedGroup);
  const totalJobs = verifiedJobs.length;
  const visibleCount = visibleJobs.length;
  const countLine = showAll
    ? `Showing ${visibleCount} of ${totalJobs} jobs`
    : `Showing ${visibleCount} English-focused job${visibleCount === 1 ? "" : "s"}`;

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
          <h2>
            {totalJobs} Open Job{totalJobs === 1 ? "" : "s"}
          </h2>
        </div>
        <ShowAllJobsToggle showAll={showAll} onChange={setShowAll} hint="" />
        <p className="section-subtitle job-count-line">{countLine}</p>

        {jobGroups.length > 0 && (
          <div className="studio-filter">
            <button
              type="button"
              className={selectedGroup === null ? "studio-pill studio-pill-active" : "studio-pill"}
              onClick={() => setSelectedGroup(null)}
            >
              {ALL_GROUPS_LABEL} ({companyJobs.length})
            </button>
            {jobGroups.map(({ name, count }) => (
              <button
                key={name}
                type="button"
                className={selectedGroup === name ? "studio-pill studio-pill-active" : "studio-pill"}
                onClick={() => setSelectedGroup(name)}
              >
                {name} ({count})
              </button>
            ))}
          </div>
        )}

        {verifiedJobs.length === 0 && (
          <p className="state-message">No verified jobs yet.</p>
        )}
        {verifiedJobs.length > 0 && companyJobs.length === 0 && (
          <p className="state-message">
            No English-focused jobs for this company. Use “Show all jobs” to see other postings.
          </p>
        )}
        {companyJobs.length > 0 && visibleJobs.length === 0 && (
          <p className="state-message">No jobs for the selected office/studio. Choose “{ALL_GROUPS_LABEL}” to see others.</p>
        )}

        <div className="card-grid">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
