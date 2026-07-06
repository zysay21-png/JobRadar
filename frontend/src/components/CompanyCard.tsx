import { Link } from "react-router-dom";
import type { Company } from "../types";
import { formatLocation } from "../utils/location";

function workModes(company: Company): string[] {
  const modes: string[] = [];
  if (company.remote) modes.push("Remote");
  if (company.hybrid) modes.push("Hybrid");
  if (company.onsite) modes.push("Onsite");
  return modes;
}

// `showLinks` is opt-in: existing whole-card-clickable usage (Companies
// grid) stays exactly as it was. Passing website/careers data switches to
// a layout with a separate title link plus real <a> buttons, since an <a>
// can't be nested inside another <a> (the browser silently breaks that).
export default function CompanyCard({
  company,
  jobCount,
  showLinks = false,
}: {
  company: Company;
  jobCount?: number;
  showLinks?: boolean;
}) {
  const location = formatLocation(company.city, company.country);

  const header = (
    <div className="card-header">
      <h3>{company.name}</h3>
      {typeof jobCount === "number" && (
        <span className="card-header-count">
          {jobCount} job{jobCount === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );

  const tags = (
    <div className="tag-row">
      {company.industry && <span className="tag">{company.industry}</span>}
      {company.platform && <span className="tag">{company.platform}</span>}
      {company.engine && <span className="tag">{company.engine}</span>}
      {workModes(company).map((mode) => (
        <span className="tag" key={mode}>
          {mode}
        </span>
      ))}
    </div>
  );

  const meta = (
    <div className="card-meta">
      {location && <span>{location}</span>}
      {company.relocation && <span>Relocation support</span>}
      {company.visa && <span>Visa sponsorship</span>}
    </div>
  );

  if (!showLinks) {
    return (
      <Link to={`/companies/${company.id}`} className="card company-card">
        {header}
        {tags}
        {meta}
      </Link>
    );
  }

  return (
    <article className="card company-card">
      <Link to={`/companies/${company.id}`} className="company-card-title-link">
        {header}
      </Link>
      {tags}
      {meta}
      <div className="card-actions">
        {company.website && (
          <a className="btn btn-secondary" href={company.website} target="_blank" rel="noreferrer">
            Website
          </a>
        )}
        {company.careers_url && (
          <a className="btn btn-primary" href={company.careers_url} target="_blank" rel="noreferrer">
            Careers
          </a>
        )}
      </div>
    </article>
  );
}
