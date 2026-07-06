import type { Job } from "../types";
import { jobDepartmentLabel, jobStudioLabel, studioUsesCityField } from "../utils/jobGroups";
import { formatLocation } from "../utils/location";
import { displayWorkArrangement } from "../utils/workArrangement";

export default function JobCard({ job, isNew = false }: { job: Job; isNew?: boolean }) {
  const companyName = job.company?.name ?? "";
  const studio = jobStudioLabel(job, companyName);
  const department = jobDepartmentLabel(job, companyName);

  // When this company's studio badge already comes from the city field
  // (e.g. Rockstar's "Rockstar North"), don't repeat it in the plain
  // location line too — the studio badge already conveys the location.
  const locationCity = studioUsesCityField(companyName) ? null : job.city;
  const location = formatLocation(locationCity, job.country);
  const workArrangement = displayWorkArrangement(job.work_model);

  return (
    <article className="card job-card">
      <div className="card-header">
        {job.company && <p className="card-subtitle">{job.company.name}</p>}
        <div className="badge-row">
          {isNew && <span className="badge badge-new">New</span>}
          <span className={job.is_verified ? "badge badge-verified" : "badge badge-review"}>
            {job.is_verified ? "Verified" : "Needs review"}
          </span>
        </div>
      </div>

      <h3 className="job-card-title">{job.title}</h3>

      {(studio || department) && (
        <div className="tag-row">
          {studio && (
            <span className="tag tag-studio" title={studio}>
              {studio}
            </span>
          )}
          {department && (
            <span className="tag tag-department" title={department}>
              {department}
            </span>
          )}
        </div>
      )}

      {(location || workArrangement) && (
        <div className="job-card-info">
          {location && (
            <span className="meta-location" title={location}>
              {location}
            </span>
          )}
          {workArrangement && <span className="work-arrangement">{workArrangement}</span>}
        </div>
      )}

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
