import { getCompanies } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import CompanyCard from "../components/CompanyCard";

export default function Companies() {
  const { data: companies, loading, error } = useApiData(getCompanies);

  return (
    <div className="page">
      <div className="section-header">
        <h2>Companies</h2>
      </div>

      {loading && <p className="state-message">Loading companies...</p>}
      {error && (
        <p className="state-message state-error">Failed to load companies: {error}</p>
      )}
      {!loading && !error && companies?.length === 0 && (
        <p className="state-message">No companies available yet.</p>
      )}

      <div className="card-grid">
        {companies?.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
