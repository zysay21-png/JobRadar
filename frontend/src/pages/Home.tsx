import { Link } from "react-router-dom";
import { getImporterState, getJobs } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import JobCard from "../components/JobCard";
import RefreshJobsButton from "../components/RefreshJobsButton";
import { activeJobs, isNewJob, NO_NEW_JOBS_MESSAGE, NO_VERIFIED_JOBS_MESSAGE } from "../utils/jobs";

export default function Home() {
  const { data: jobs, loading, error, refetch: refetchJobs } = useApiData(getJobs);
  const { data: importerState, refetch: refetchState } = useApiData(getImporterState);

  const verifiedJobs = activeJobs(jobs ?? []);
  const lastRefreshAt = importerState?.last_refresh_at ?? null;
  const newJobs = verifiedJobs.filter((job) => isNewJob(job, lastRefreshAt));
  const recentJobs = verifiedJobs.slice(0, 6);

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
          <Link to="/jobs" className="button-primary">
            Browse all jobs
          </Link>
          <RefreshJobsButton onRefreshed={handleRefreshed} />
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>New Since Last Check</h2>
        </div>
        <p className="section-subtitle">Jobs discovered during the most recent refresh.</p>

        {!loading && !error && newJobs.length === 0 && (
          <p className="state-message">{NO_NEW_JOBS_MESSAGE}</p>
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
        <div className="section-header">
          <h2>Latest Verified Jobs</h2>
          <Link to="/jobs" className="section-link">
            View all
          </Link>
        </div>
        <p className="section-subtitle">Newest verified openings.</p>

        {loading && <p className="state-message">Loading jobs...</p>}
        {error && <p className="state-message state-error">Failed to load jobs: {error}</p>}
        {!loading && !error && recentJobs.length === 0 && (
          <p className="state-message">{NO_VERIFIED_JOBS_MESSAGE}</p>
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
