import type { Job } from "../types";
import { formatJobDate } from "../utils/jobs";
import { jobDepartmentLabel, jobStudioLabel, studioUsesCityField } from "../utils/jobGroups";
import { formatLocation } from "../utils/location";

export default function JobCard({ job, isNew = false }: { job: Job; isNew?: boolean }) {
  const companyName = job.company?.name ?? "";
  const studio = jobStudioLabel(job, companyName);
  const department = jobDepartmentLabel(job, companyName);

  // When this company's studio badge already comes from the city field
  // (e.g. Rockstar's "Rockstar North"), don't repeat it in the plain
  // location line too — the studio badge already conveys the location.
  const locationCity = studioUsesCityField(companyName) ? null : job.city;
  const location = formatLocation(locationCity, job.country);
  const posted = formatJobDate(job.posted_date);

  return (
    <article className="card job-card">
      {job.company && <p className="card-subtitle">{job.company.name}</p>}

      <div className="card-header">
        <h3>{job.title}</h3>
        <div className="badge-row">
          {isNew && <span className="badge badge-new">New</span>}
          <span className={job.is_verified ? "badge badge-verified" : "badge badge-review"}>
            {job.is_verified ? "Verified" : "Needs review"}
          </span>
        </div>
      </div>

      {(studio || department) && (
        <div className="tag-row">
          {studio && <span className="tag tag-studio">{studio}</span>}
          {department && <span className="tag tag-department">{department}</span>}
        </div>
      )}

      <div className="tag-row">
        {job.work_model && <span className="tag">{job.work_model}</span>}
        {job.platform && <span className="tag">{job.platform}</span>}
      </div>

      <div className="card-meta">
        {location && <span>{location}</span>}
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
