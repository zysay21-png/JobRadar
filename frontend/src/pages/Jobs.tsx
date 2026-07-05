import { getJobs } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import JobCard from "../components/JobCard";
import { activeJobs, NO_VERIFIED_JOBS_MESSAGE } from "../utils/jobs";

export default function Jobs() {
  const { data: jobs, loading, error } = useApiData(getJobs);
  const verifiedJobs = activeJobs(jobs ?? []);

  return (
    <div className="page">
      <div className="section-header">
        <h2>Active jobs</h2>
      </div>

      {loading && <p className="state-message">Loading jobs...</p>}
      {error && <p className="state-message state-error">Failed to load jobs: {error}</p>}
      {!loading && !error && verifiedJobs.length === 0 && (
        <p className="state-message">{NO_VERIFIED_JOBS_MESSAGE}</p>
      )}

      <div className="card-grid">
        {verifiedJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
