import { Link } from "react-router-dom";
import { getJobs } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import JobCard from "../components/JobCard";
import RefreshJobsButton from "../components/RefreshJobsButton";
import { activeJobs, NO_VERIFIED_JOBS_MESSAGE } from "../utils/jobs";

export default function Home() {
  const { data: jobs, loading, error, refetch } = useApiData(getJobs);
  const recentJobs = activeJobs(jobs ?? []).slice(0, 6);

  return (
    <div className="page">
      <section className="hero">
        <h1>Track game &amp; tech job openings in one place</h1>
        <p>
          Job Radar keeps an eye on studios you care about, so you can spot new
          openings as soon as they land.
        </p>
        <Link to="/jobs" className="button-primary">
          Browse all jobs
        </Link>
      </section>

      <section>
        <div className="section-header">
          <h2>Latest Verified Jobs</h2>
          <div className="section-header-actions">
            <Link to="/jobs" className="section-link">
              View all
            </Link>
            <RefreshJobsButton onRefreshed={refetch} />
          </div>
        </div>
        <p className="section-subtitle">Newest verified openings.</p>

        {loading && <p className="state-message">Loading jobs...</p>}
        {error && <p className="state-message state-error">Failed to load jobs: {error}</p>}
        {!loading && !error && recentJobs.length === 0 && (
          <p className="state-message">{NO_VERIFIED_JOBS_MESSAGE}</p>
        )}

        <div className="card-grid">
          {recentJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
