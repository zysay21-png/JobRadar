import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCompany } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import EmptyState from "../components/EmptyState";
import FilterChip from "../components/FilterChip";
import JobCard from "../components/JobCard";
import SectionHeader from "../components/SectionHeader";
import ShowAllJobsToggle from "../components/ShowAllJobsToggle";
import { activeJobs } from "../utils/jobs";
import { englishFocusedJobs } from "../utils/englishFocus";
import { formatLocation } from "../utils/location";
import {
  ALL_DEPARTMENTS_LABEL,
  ALL_LOCATIONS_LABEL,
  ALL_STUDIOS_LABEL,
  computeFacetGroups,
  EMPTY_SELECTION,
  filterByFacets,
  type FacetSelection,
} from "../utils/jobGroups";

function FacetRow({
  label,
  allLabel,
  totalCount,
  groups,
  selected,
  onSelect,
}: {
  label: string;
  allLabel: string;
  totalCount: number;
  groups: { name: string; count: number }[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}) {
  if (groups.length === 0) return null;

  return (
    <div className="facet-group">
      <span className="facet-label">{label}</span>
      <div className="filter-chip-row">
        <FilterChip
          label={allLabel}
          count={totalCount}
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        {groups.map(({ name, count }) => (
          <FilterChip
            key={name}
            label={name}
            count={count}
            active={selected === name}
            onClick={() => onSelect(name)}
          />
        ))}
      </div>
    </div>
  );
}

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = Number(companyId);
  const [showAll, setShowAll] = useState(false);
  const [selection, setSelection] = useState<FacetSelection>(EMPTY_SELECTION);

  const { data: company, loading, error } = useApiData(() => getCompany(id));
  const verifiedJobs = activeJobs(company?.jobs ?? []);
  const companyJobs = showAll ? verifiedJobs : englishFocusedJobs(verifiedJobs);
  const companyName = company?.name ?? "";
  const facetGroups = computeFacetGroups(companyJobs, companyName);
  const visibleJobs = filterByFacets(companyJobs, companyName, selection);
  const totalJobs = verifiedJobs.length;
  const visibleCount = visibleJobs.length;
  const countLine = showAll
    ? `Showing ${visibleCount} of ${totalJobs} jobs`
    : `Showing ${visibleCount} English-focused job${visibleCount === 1 ? "" : "s"}`;

  if (loading) {
    return (
      <div className="page">
        <p className="state-message">Loading company...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="page">
        <p className="state-message">Company not found.</p>
        <Link to="/companies" className="section-link">
          &larr; Back to companies
        </Link>
      </div>
    );
  }

  const location = formatLocation(company.city, company.country);

  return (
    <div className="page">
      <Link to="/companies" className="section-link">
        &larr; Back to companies
      </Link>

      <section className="company-detail-header">
        <h1>{company.name}</h1>
        <div className="tag-row">
          {company.industry && <span className="tag">{company.industry}</span>}
          {company.platform && <span className="tag">{company.platform}</span>}
          {company.engine && <span className="tag">{company.engine}</span>}
          {company.remote && <span className="tag">Remote</span>}
          {company.hybrid && <span className="tag">Hybrid</span>}
          {company.onsite && <span className="tag">Onsite</span>}
        </div>
        <div className="card-meta">
          {location && <span>{location}</span>}
          {company.relocation && <span>Relocation support</span>}
          {company.visa && <span>Visa sponsorship</span>}
        </div>
        <div className="card-actions company-detail-actions">
          {company.website && (
            <a
              className="btn btn-secondary"
              href={company.website}
              target="_blank"
              rel="noreferrer"
            >
              Official Website
            </a>
          )}
          {company.careers_url && (
            <a
              className="btn btn-primary"
              href={company.careers_url}
              target="_blank"
              rel="noreferrer"
            >
              Official Careers Page &rarr;
            </a>
          )}
        </div>
      </section>

      <section>
        <SectionHeader title={`${totalJobs} Open Job${totalJobs === 1 ? "" : "s"}`} />
        <ShowAllJobsToggle showAll={showAll} onChange={setShowAll} hint="" />
        <p className="section-subtitle job-count-line">{countLine}</p>

        <FacetRow
          label="Studio / Office"
          allLabel={ALL_STUDIOS_LABEL}
          totalCount={companyJobs.length}
          groups={facetGroups.studio}
          selected={selection.studio}
          onSelect={(value) => setSelection((prev) => ({ ...prev, studio: value }))}
        />
        <FacetRow
          label="Department"
          allLabel={ALL_DEPARTMENTS_LABEL}
          totalCount={companyJobs.length}
          groups={facetGroups.department}
          selected={selection.department}
          onSelect={(value) => setSelection((prev) => ({ ...prev, department: value }))}
        />
        <FacetRow
          label="Location"
          allLabel={ALL_LOCATIONS_LABEL}
          totalCount={companyJobs.length}
          groups={facetGroups.location}
          selected={selection.location}
          onSelect={(value) => setSelection((prev) => ({ ...prev, location: value }))}
        />

        {verifiedJobs.length === 0 && <EmptyState message="No verified jobs yet." />}
        {verifiedJobs.length > 0 && companyJobs.length === 0 && (
          <EmptyState message='No English-focused jobs for this company. Use "Show all jobs" to see other postings.' />
        )}
        {companyJobs.length > 0 && visibleJobs.length === 0 && (
          <EmptyState message="No jobs match the selected filters. Reset a filter to see others." />
        )}

        <div className="card-grid">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
