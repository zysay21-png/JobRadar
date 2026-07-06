import { useState } from "react";
import { Link } from "react-router-dom";
import { getImporterState, getJobs } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import EmptyState from "../components/EmptyState";
import JobCard from "../components/JobCard";
import RefreshJobsButton from "../components/RefreshJobsButton";
import SectionHeader from "../components/SectionHeader";
import ShowAllJobsToggle from "../components/ShowAllJobsToggle";
import { activeJobs, isNewJob, NO_NEW_JOBS_MESSAGE, NO_VERIFIED_JOBS_MESSAGE } from "../utils/jobs";
import { englishFocusedJobs } from "../utils/englishFocus";

export default function Home() {
  const { data: jobs, loading, error, refetch: refetchJobs } = useApiData(getJobs);
  const { data: importerState, refetch: refetchState } = useApiData(getImporterState);
  const [showAll, setShowAll] = useState(false);

  const verifiedJobs = activeJobs(jobs ?? []);
  const visibleJobs = showAll ? verifiedJobs : englishFocusedJobs(verifiedJobs);
  const lastRefreshAt = importerState?.last_refresh_at ?? null;
  const newJobs = visibleJobs.filter((job) => isNewJob(job, lastRefreshAt));
  const recentJobs = visibleJobs.slice(0, 6);

  function handleRefreshed() {
    refetchJobs();
    refetchState();
  }

  return (
    <div className="page">
      <section className="hero">
        <h1>Track game &amp; tech job openings in one place</h1>
        <p>
          Job Radar keeps an eye on studios you care about, so you can spot new
          openings as soon as they land.
        </p>
        <div className="hero-actions">
          <Link to="/companies" className="button-primary">
            Browse companies
          </Link>
          <Link to="/jobs" className="btn btn-secondary btn-lg">
            Browse all jobs
          </Link>
          <RefreshJobsButton onRefreshed={handleRefreshed} />
        </div>
      </section>

      <ShowAllJobsToggle showAll={showAll} onChange={setShowAll} />

      <section>
        <SectionHeader
          title="New Since Last Check"
          subtitle="Jobs discovered during the most recent refresh."
        />

        {!loading && !error && newJobs.length === 0 && (
          <EmptyState message={NO_NEW_JOBS_MESSAGE} />
        )}

        {newJobs.length > 0 && (
          <div className="card-grid">
            {newJobs.map((job) => (
              <JobCard key={job.id} job={job} isNew />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Latest Verified Jobs"
          subtitle="Newest verified openings."
          action={
            <Link to="/jobs" className="section-link">
              View all
            </Link>
          }
        />

        {loading && <p className="state-message">Loading jobs...</p>}
        {error && <p className="state-message state-error">Failed to load jobs: {error}</p>}
        {!loading && !error && recentJobs.length === 0 && (
          <EmptyState message={NO_VERIFIED_JOBS_MESSAGE} />
        )}

        <div className="card-grid">
          {recentJobs.map((job) => (
            <JobCard key={job.id} job={job} isNew={isNewJob(job, lastRefreshAt)} />
          ))}
        </div>
      </section>
    </div>
  );
}
