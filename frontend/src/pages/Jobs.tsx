import { useState } from "react";
import { getJobs } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import EmptyState from "../components/EmptyState";
import JobCard from "../components/JobCard";
import RefreshJobsButton from "../components/RefreshJobsButton";
import SectionHeader from "../components/SectionHeader";
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
      <SectionHeader
        level={1}
        title="Active jobs"
        subtitle="All verified job postings."
        action={<RefreshJobsButton onRefreshed={refetch} />}
      />
      <ShowAllJobsToggle showAll={showAll} onChange={setShowAll} />

      {loading && <p className="state-message">Loading jobs...</p>}
      {error && <p className="state-message state-error">Failed to load jobs: {error}</p>}
      {!loading && !error && visibleJobs.length === 0 && (
        <EmptyState message={NO_VERIFIED_JOBS_MESSAGE} />
      )}

      <div className="card-grid">
        {visibleJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
