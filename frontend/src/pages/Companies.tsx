import { useMemo } from "react";
import { getCompanies, getJobs } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import CompanyCard from "../components/CompanyCard";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import { activeJobs } from "../utils/jobs";
import { companiesWithMultipleOffices } from "../utils/officePresence";

export default function Companies() {
  const { data: companies, loading, error } = useApiData(getCompanies);
  const { data: jobs } = useApiData(getJobs);

  const multiOfficeIds = useMemo(
    () => companiesWithMultipleOffices(activeJobs(jobs ?? [])),
    [jobs]
  );

  return (
    <div className="page">
      <SectionHeader
        level={1}
        title="Companies"
        subtitle="All tracked companies, including companies with no jobs yet."
        action={
          !loading && !error && companies ? (
            <span className="section-count">{companies.length} companies</span>
          ) : undefined
        }
      />

      {loading && <p className="state-message">Loading companies...</p>}
      {error && (
        <p className="state-message state-error">Failed to load companies: {error}</p>
      )}
      {!loading && !error && companies?.length === 0 && (
        <EmptyState message="No companies available yet." />
      )}

      <div className="card-grid">
        {companies?.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            multipleOffices={multiOfficeIds.has(company.id)}
          />
        ))}
      </div>
    </div>
  );
}
