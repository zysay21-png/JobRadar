import { getCompanies } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import CompanyCard from "../components/CompanyCard";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";

export default function Companies() {
  const { data: companies, loading, error } = useApiData(getCompanies);

  return (
    <div className="page">
      <SectionHeader
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
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
