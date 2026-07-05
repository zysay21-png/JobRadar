import type { Job } from "../types";

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function JobCard({ job }: { job: Job }) {
  const location = [job.city, job.country].filter(Boolean).join(", ");
  const posted = formatDate(job.posted_date);

  return (
    <article className="card job-card">
      <div className="card-header">
        <h3>{job.title}</h3>
        <span className={`status-badge status-${job.status}`}>{job.status}</span>
      </div>

      {job.company && <p className="card-subtitle">{job.company.name}</p>}

      <div className="tag-row">
        {job.work_model && <span className="tag">{job.work_model}</span>}
        {job.experience_level && <span className="tag">{job.experience_level}</span>}
        {job.platform && <span className="tag">{job.platform}</span>}
      </div>

      <div className="card-meta">
        {location && <span>{location}</span>}
        {job.department && <span>{job.department}</span>}
        {posted && <span>Posted {posted}</span>}
      </div>

      {job.official_url && (
        <a
          className="card-link"
          href={job.official_url}
          target="_blank"
          rel="noreferrer"
        >
          View posting &rarr;
        </a>
      )}
    </article>
  );
}
