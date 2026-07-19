# UI Display Standard

**Status: mandatory.** This is the permanent set of display rules for
every page and component in the Job Radar frontend, adopted as official
project policy alongside
[`docs/COMPANY_ONBOARDING_STANDARD.md`](COMPANY_ONBOARDING_STANDARD.md).

This document is about **presentation only**. It never changes what data
gets imported or how — see the onboarding standard for that. The backend
remains the single source of truth; the frontend's only job is to present
that truth consistently and legibly. For the canonical shape of each data
field this document formats (countries, states, cities, URLs, dates,
company/studio/department names), see
[`docs/DATA_STANDARDS.md`](DATA_STANDARDS.md) — every display rule below
must agree with it.

---

## RULE 1 — Preserve Official Data

- Backend and importers keep raw official data exactly as the source
  provides it — this document never asks for a change there.
- The frontend may normalize *display* only: reformatting how something
  is shown, never changing what was actually imported.
- Never invent data that isn't present. A normalization is display
  formatting; a guess is fabrication — the difference matters.

## RULE 2 — Full Country Names

- Always display the full English country name in the UI, never a raw
  ISO code or an inconsistent variant.
- If the backend stores an ISO 3166-1 alpha-2 code (`IL`, `PL`, `UA`,
  `US`, `DE`, `FR`, ...) or a known long-form/alias variant (`"United
  States of America"`, `"Korea, Republic of"`, `"Taiwan, Province of
  China"`, ...), the frontend converts it to its standard full name.
- If the backend already stores a full country name, it's shown
  unchanged.
- Support **all** ISO 3166-1 alpha-2 codes — not a hand-picked subset
  that happens to cover today's imported companies. A future company
  introducing a new code should not require a follow-up patch just to
  render its country correctly.
- Never show mixed formats side by side (e.g. "Israel" next to "PL",
  "Germany" next to "US") — every country, everywhere in the UI, goes
  through the same normalization.
- This is a UI-only concern: `job.country` / `company.country` are never
  rewritten in the database.

## RULE 3 — Missing Data

Never render a placeholder as if it were real data. Specifically, never
show:
- "Location not specified"
- "BLANK"
- the literal strings `null` or `undefined`
- empty/dangling commas (`", "`, `",  ,"`)
- a malformed joined string (e.g. an unformatted `"city,state,country"`
  concatenation with no spacing)

If, after cleanup, there's nothing usable left for a field, **hide the
row entirely** rather than filling it with fallback text.

## RULE 4 — Clean Location Display

Location filters and JobCard location display have different
responsibilities — a filter groups jobs at a coarse level; a job card
shows the specific place that job is actually located.

**Company page Location filter:**
- Groups by country only, never by city or a mix of granularities.
- Uses full English country names (per Rule 2).
- Example values: United States, United Kingdom, Israel, Poland.

**JobCard location display:**
- Shows the full useful local location, not just the country:
  - City + state + country, when all three exist: `Austin, TX, United
    States`
  - City + country, when there's no state: `London, United Kingdom`
  - Country only, when that's all that's available: `United Kingdom`
- Never show city alone when a country is also available — a bare city
  name can be ambiguous without it.
- If the official source explicitly says "Multiple Locations", display
  exactly `"Multiple Locations"` — verbatim, not expanded or guessed at.
- Hide the location line only when there's no useful location at all (per
  Rule 3) — not merely because it would be shorter to omit it.
- If a studio/office label already gives the reader clear location
  context (e.g. "Rockstar Leeds"), a duplicate location line may be
  omitted — but only when doing so doesn't create ambiguity. Dropping a
  location is fine when the studio name alone already makes the place
  obvious; it is not fine when that location line is the only place a
  user would actually learn it.

## RULE 5 — Consistent Company Pages

Every company detail page follows the same structure, in this order:

1. Company overview (name, tags, official website/careers links).
2. Job summary / open-job count.
3. Studios/offices overview, if the company has one (showcase/grouping).
4. Department filter, if the company has real department data.
5. Location filter, only if it's actually useful (not shown when it
   would just repeat the studio/office grouping, or when there's only
   one real location).
6. Job cards.

A company with fewer of these facets (e.g. no studios, no departments)
simply skips the sections that don't apply — the structure stays the
same, sections just collapse when there's nothing real to show.

## RULE 6 — Do Not Mix Concepts

- Studios/offices and departments are never combined into the same
  filter row or the same pill list.
- **Studios/offices** are for overview and grouping — "which
  studio/brand/office is this role part of."
- **Departments** are filters — "which functional team is this role
  part of."
- These are different questions about a job and must stay visually and
  structurally separate, even when both happen to be derived from the
  same underlying source field for a given company.

## RULE 7 — Job Card Standard

Every job card shows, when the data is available (and hides the line
entirely when it isn't, per Rule 3):
- Title
- Studio/office, if available
- Department/team, if available
- Clean location, if available (per Rule 2 and Rule 4)
- Posted date, if available
- Verified badge
- Official Posting button

## RULE 8 — Visual Style

- Keep the dark theme.
- Keep the layout modern, clean, readable, and user-friendly.
- Prioritize scannability over density — a user should be able to tell
  what a card or section is about at a glance, not by reading every
  word.

## RULE 9 — Apply Everywhere

These rules apply consistently across the whole frontend, not just
wherever they were first introduced:
- Home
- Companies page
- Company detail pages
- Job cards
- Filters
- Search results (once search exists)

## RULE 10 — No Redesign Without a Task

This document defines the standard; it doesn't authorize applying it.
Don't change UI code as a side effect of reading or updating this
document. Frontend changes happen in their own explicitly-scoped task,
same as any other change in this project.

## RULE 11 — UI Consistency First

When introducing a new frontend feature or component:

- Prefer extending an existing pattern instead of creating a new one.
- Keep layouts, spacing, typography, buttons, badges, chips, filters,
  cards, and interactions consistent across the application.
- A user should not have to learn a different interface for each company
  page.
- If a new UI pattern is introduced, it should be reusable across the
  project instead of solving only one company's needs.

## RULE 12 — User First

Every frontend decision should optimize for:

1. Readability
2. Scannability
3. Discoverability
4. Consistency
5. Responsiveness

When multiple implementations are technically correct, choose the one
that helps users find, understand, and navigate jobs more quickly.

The interface should provide a consistent experience across:
- Desktop
- Laptop
- Tablet
- Mobile

Responsive behavior should be built into new UI components from the
start rather than added later.

Every UI decision should reduce friction for users searching for jobs.

## RULE 14 — Shared Components First

Before making broad UI changes, prefer creating or reusing shared
components.

Core shared components:
- JobCard
- CompanyCard
- FilterChip
- SectionHeader
- StatCard
- EmptyState

Requirements:
- Do not create one-off UI patterns when a reusable component can solve
  the problem.
- Shared components should follow the UI Display Standard.
- Shared components should support responsive layouts.
- Shared components should keep spacing, typography, buttons, badges,
  chips, and empty states consistent.
- If a page needs a new UI pattern, consider whether it should become a
  shared component first.
- Future UI polish should reuse these components instead of duplicating
  layout code.

## RULE 15 — Flexible Metadata

Metadata should adapt gracefully to different content lengths.

Requirements:
- Long labels must not break the layout.
- Cards should remain visually aligned.
- Long chips may wrap or truncate with ellipsis.
- Full values should remain accessible (e.g. tooltip/title).
- Preserve official data.
- Do not abbreviate or rename official values.

---

Every future frontend change — new page, new component, new company page
feature — is expected to follow this document. If a new situation isn't
clearly covered above, resolve it in the direction of Rule 1 and Rule 3
(preserve official data, hide rather than fabricate) and document the new
precedent here.
