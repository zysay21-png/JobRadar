import { useState } from "react";
import { getJobs } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import JobCard from "../components/JobCard";
import RefreshJobsButton from "../components/RefreshJobsButton";
import ShowAllJobsToggle from "../components/ShowAllJobsToggle";
import { activeJobs, NO_VERIFIED_JOBS_MESSAGE } from "../utils/jobs";
import { englishFocusedJobs } from "../utils/englishFocus";

export default function Jobs() {
  const { data: jobs, loading, error, refetch } = useApiData(getJobs);
  const [showAll, setShowAll] = useState(false);
  const verifiedJobs = activeJobs(jobs ?? []);
  const visibleJobs = showAll ? verifiedJobs : englishFocusedJobs(verifiedJobs);

  return (
    <div className="page">
      <div className="section-header">
        <h2>Active jobs</h2>
        <div className="section-header-actions">
          <RefreshJobsButton onRefreshed={refetch} />
        </div>
      </div>
      <p className="section-subtitle">All verified job postings.</p>
      <ShowAllJobsToggle showAll={showAll} onChange={setShowAll} />

      {loading && <p className="state-message">Loading jobs...</p>}
      {error && <p className="state-message state-error">Failed to load jobs: {error}</p>}
      {!loading && !error && visibleJobs.length === 0 && (
        <p className="state-message">{NO_VERIFIED_JOBS_MESSAGE}</p>
      )}

      <div className="card-grid">
        {visibleJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
