import type { Job } from "../types";
import { formatJobDate } from "../utils/jobs";

export default function JobCard({ job }: { job: Job }) {
  const location = [job.city, job.country].filter(Boolean).join(", ") || "Location not specified";
  const posted = formatJobDate(job.posted_date);

  return (
    <article className="card job-card">
      {job.company && <p className="card-subtitle">{job.company.name}</p>}

      <div className="card-header">
        <h3>{job.title}</h3>
        <span className={job.is_verified ? "badge badge-verified" : "badge badge-review"}>
          {job.is_verified ? "Verified" : "Needs review"}
        </span>
      </div>

      <div className="tag-row">
        {job.work_model && <span className="tag">{job.work_model}</span>}
        {job.platform && <span className="tag">{job.platform}</span>}
      </div>

      <div className="card-meta">
        <span>{location}</span>
        {posted && <span>Posted {posted}</span>}
      </div>

      <div className="card-actions">
        {job.official_url && (
          <a
            className="btn btn-primary"
            href={job.official_url}
            target="_blank"
            rel="noreferrer"
          >
            Official Posting
          </a>
        )}
      </div>
    </article>
  );
}
