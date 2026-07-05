import { Link } from "react-router-dom";
import type { Company } from "../types";

function workModes(company: Company): string[] {
  const modes: string[] = [];
  if (company.remote) modes.push("Remote");
  if (company.hybrid) modes.push("Hybrid");
  if (company.onsite) modes.push("Onsite");
  return modes;
}

export default function CompanyCard({ company }: { company: Company }) {
  const location = [company.city, company.country].filter(Boolean).join(", ");

  return (
    <Link to={`/companies/${company.id}`} className="card company-card">
      <div className="card-header">
        <h3>{company.name}</h3>
      </div>

      <div className="tag-row">
        {company.platform && <span className="tag">{company.platform}</span>}
        {company.engine && <span className="tag">{company.engine}</span>}
        {workModes(company).map((mode) => (
          <span className="tag" key={mode}>
            {mode}
          </span>
        ))}
      </div>

      <div className="card-meta">
        {location && <span>{location}</span>}
        {company.relocation && <span>Relocation support</span>}
        {company.visa && <span>Visa sponsorship</span>}
      </div>
    </Link>
  );
}
