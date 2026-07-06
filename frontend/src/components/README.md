# Shared Components

Per [`docs/UI_DISPLAY_STANDARD.md`](../../../docs/UI_DISPLAY_STANDARD.md)
Rule 14 (Shared Components First). Prefer these over one-off layout code.

## JobCard
`<JobCard job={job} isNew?={boolean} />`
Renders company, title, studio/office, department, platform tags, clean
location (Rule 2–4), posted date, verified badge, and the official-posting
button pinned to the card's bottom edge. Used on Home, Jobs, CompanyDetail.

## CompanyCard
`<CompanyCard company={company} jobCount?={number} showLinks?={boolean} />`
Default (`showLinks` omitted): whole card is a single link to the company
page — used on the Companies grid, unchanged behavior.
`showLinks`: renders a separate title link plus real website/careers `<a>`
buttons (an `<a>` can't be nested inside another `<a>`, so this is a
distinct layout, not a prop toggle on the same markup). Not adopted by any
page yet — available for a future company list that also needs the links.

## FilterChip
`<FilterChip label={string} count?={number} active?={boolean} onClick={fn} />`
One pill in a filter row. Used by CompanyDetail's studio/department/location
facets (`.filter-chip-row` wrapper).

## SectionHeader
`<SectionHeader title={ReactNode} subtitle?={ReactNode} action?={ReactNode} />`
Title + optional helper text + optional right-aligned action (link,
button, count). Used on Home, Companies, Jobs, CompanyDetail.

## StatCard
`<StatCard label={string} value={string|number} helperText?={string} />`
A single labeled metric tile; group several in a `.stat-card-row` flex
container. Not adopted by any page yet — ready for a future stats/summary
section (e.g. total open jobs, companies tracked).

## EmptyState
`<EmptyState title?={string} message={ReactNode} action?={ReactNode} />`
Use when a list/section has genuinely no data to show (Rule 3: never a
placeholder pretending to be real data). Not for loading or error states —
those stay as plain `.state-message` / `.state-error` text.
