import { Link } from "react-router-dom";
import type { Company } from "../types";
import { formatLocation } from "../utils/location";
import { displayPlatform } from "../utils/platform";

// The Companies page answers one question — which company do I want to
// explore — so the card only shows what's needed to decide that: name,
// platform, and headquarters. Employment specifics (industry, engine,
// work model, relocation/visa) belong on the company detail and job
// pages, not here.
//
// `showLinks` is opt-in: existing whole-card-clickable usage (Companies
// grid) stays exactly as it was. Passing website/careers data switches to
// a layout with a separate title link plus real <a> buttons, since an <a>
// can't be nested inside another <a> (the browser silently breaks that).
export default function CompanyCard({
  company,
  jobCount,
  showLinks = false,
  multipleOffices = false,
}: {
  company: Company;
  jobCount?: number;
  showLinks?: boolean;
  // True when the company's imported jobs span 2+ distinct real office
  // locations — showing just the headquarters would then misrepresent a
  // company that actually develops out of many studios as being limited
  // to one.
  multipleOffices?: boolean;
}) {
  const location = multipleOffices ? "Multiple Studios" : formatLocation(company.city, company.country);
  const platform = displayPlatform(company.platform);

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
      {platform && (
        <span className="tag" title={company.platform ?? undefined}>
          {platform}
        </span>
      )}
    </div>
  );

  const meta = (
    <div className="card-meta">
      {location && (
        <span className="meta-location" title={location}>
          {location}
        </span>
      )}
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
