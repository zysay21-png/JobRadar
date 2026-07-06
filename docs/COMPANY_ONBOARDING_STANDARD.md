# Company Onboarding Standard

**Status: mandatory.** Every company, importer, platform, or ATS added to
Job Radar from this point forward must follow this workflow. This is not
a suggestion or a style guide — it is the permanent process, adopted as
official project policy.

Job Radar exists to show real, verified job postings sourced from
official company career pages. Every rule below exists to protect that
one property. When a rule and convenience conflict, the rule wins.

This document covers *what data gets imported and how*. For how that
data is *presented* once it's in the database — country name formatting,
location cleanup, job card structure, company page layout — see
[`docs/UI_DISPLAY_STANDARD.md`](UI_DISPLAY_STANDARD.md), the frontend's
equivalent permanent standard.

---

## RULE 0 — Research First

Before writing any code, answer all of the following from the company's
own official careers page:

1. What is the official careers URL?
2. What ATS/platform actually serves the job data (inspect network
   requests / page source — don't assume from the company's size or
   category)?
3. Does a reusable importer for that ATS already exist in
   `backend/app/importers/platforms/`?
4. Does this company have multiple studios, offices, or brands?
5. Could importing this company create duplicate jobs — most often
   because it's a subsidiary/studio of a company already tracked (see
   the Bungie/Naughty Dog/Insomniac Games situation below)?
6. What official fields does the source actually expose (title,
   department, studio/brand, city, country, work model, posting date)?

Nothing below can be done correctly if this step is skipped.

## RULE 1 — Official Source Only

Only ever fetch from the company's own official careers page or the
ATS endpoint that page itself calls. Never use a third-party job
aggregator, a cached mirror, or a guess at what the company "probably"
posts.

## RULE 2 — Detect ATS, Never Guess

Identify the real ATS before writing a line of importer code. Confirm it
directly — inspect the page's own network calls, embedded JSON, redirect
targets, or session cookies (e.g. SuccessFactors' `ScustomPortal` cookie,
Ashby's `api.ashbyhq.com` calls, Comeet's embedded `comeet_token` /
`comeet_company_uid`). If the platform can't be confirmed (bot-protected,
client-rendered with no visible network call), the company is `unknown`
until it can be — never assign a platform on a guess.

## RULE 3 — Reuse Existing Importers

- **ATS already has a reusable importer** (currently: Greenhouse,
  Comeet) → add the company through **configuration only**, in
  `backend/app/importers/config.py`. No new file, no new class.
- **ATS is new but genuinely reusable** (a real third-party product a
  second company could plausibly also use) → build one new importer in
  `backend/app/importers/platforms/`, following the existing single-company
  pattern (see `arenanet.py`, `gunfire_games.py`, `electronic_arts.py`).
  Generalize it into a config-driven module — the same shape as the
  Comeet refactor — the moment a **second** confirmed company appears on
  it. That second company is the trigger; don't generalize speculatively
  on a single data point, and don't keep writing one-off files once a
  second one shows up either.
- **ATS is proprietary / in-house** (Rockstar's own GraphQL API,
  PlayStation's Paradox site, Riot's embedded page JSON) → build one
  importer in `backend/app/importers/custom/`. Nothing to generalize,
  ever — one file per company, permanently.

Never create a second custom importer for a platform that already has a
platform-folder importer, and never build a "just this once" one-off for
an ATS that's already config-driven.

## RULE 4 — Company Structure

Determine whether the company has studios, offices, brands, or regions
**before** touching the companies table. Keep exactly **one** parent
company row. Never create a second company row for a studio, office, or
brand — this has come up repeatedly (Rockstar's studios, PlayStation's
first-party studios, Moon Active's and SuperPlay's international offices,
EA's internal studio brands, Riot's product teams) and the answer is
always the same: one row, richer per-job data.

Group jobs, in this priority order, using whichever field the source
actually and unambiguously provides — never invent a grouping dimension
that isn't really there:

1. **Studio/Brand** — e.g. PlayStation's `brandName` (Naughty Dog,
   Insomniac, Bungie), EA's `Studio/Department` field, Riot's product
   team.
2. **Office/Location** — e.g. Rockstar's studio-as-city (Rockstar North,
   Rockstar Toronto), Moon Active's and SuperPlay's real office cities
   (Tel Aviv-Yafo, Warsaw, Bucharest).
3. **Department/Team** — a genuine functional department, only when
   neither of the above exists.
4. **General** — the fallback when a company has only one office, one
   studio, and nothing meaningful to group by. A single-group company
   gets no picker at all in the frontend (see `jobGroups.ts`) — a picker
   with one option isn't worth showing.

A field named "department" does not automatically mean "department" —
read what it actually contains per company before deciding what it
represents (PlayStation's `department` is a studio name; Rockstar's is a
real functional team; get this backwards and the grouping lies to the
user).

### The duplicate-parent-studio trap

Before importing any company, check whether it's a subsidiary/studio of
a company Job Radar **already tracks**. This is a real, recurring risk,
not a hypothetical: Bungie, Naughty Dog, and Insomniac Games are all
first-party PlayStation Studios, and their jobs may already be present
under "Sony Interactive Entertainment" via the PlayStation importer's
studio field. Bungie's own Greenhouse board was confirmed to expose the
exact same requisition ("Marathon UI/UX Director") already sitting in
the database under Sony Interactive Entertainment — same job, two
different `official_url` formats, which today's exact-URL dedupe would
not catch. Do not add a company in this situation until a parent-company/
dedupe decision has been made and documented.

## RULE 5 — Import Official Fields

Import every official field the source actually exposes. Never invent a
value for a field the source doesn't provide — leave it `null`/empty
instead. Examples already established in this codebase: Riot Games and
Rockstar Games have no posted-date field anywhere, so `posted_date` is
left unset for both, rather than guessed from anything else.

## RULE 6 — Verification (backend)

Before considering a company done, verify all of the following, live,
against the real database — not just in isolation:

- **Duplicate prevention** — run the importer twice; the second run must
  add 0 jobs.
- **`official_url` uniqueness** — query the database for any duplicate
  `official_url` across the whole table, not just this company.
- **Idempotency** — same as duplicate prevention: two consecutive runs
  must produce identical `added: 0` results with no unexpected updates.
- **`first_seen`** — set once, on first import, and never touched again
  on subsequent updates.
- **`last_checked`** — updated on every run, for every job, whether it
  changed or not.
- **Close-on-disappear** — simulate a job vanishing from the source
  (drop it from the parsed list before calling `sync_jobs`) and confirm
  it flips to `status = "closed"` rather than being deleted, then restore
  real state with a normal run afterward.

## RULE 7 — Frontend Verification

After the backend is confirmed, verify in a live browser (not just by
reading code):

- The company appears on the Companies page, and the total company count
  is what's expected (no accidental duplicate row).
- The company's detail page loads and shows the correct open-job count.
- Studio/office grouping renders correctly if the company has more than
  one group — or correctly shows no picker at all if it doesn't.
- The English-focused / Show all jobs toggle works and the visible count
  updates immediately and correctly in both states.
- Job counts shown in the UI match what the database and API actually
  return — no off-by-one, no stale cache.

## RULE 8 — Documentation

Update, every time:

- **ATS registry** — the platform/company breakdown in
  `backend/app/importers/README.md` (which companies are on which
  platform, and why each single-company platform importer hasn't been
  generalized yet).
- **Importer documentation** — code comments in the importer/config
  explaining exactly how the platform/token/UID was confirmed, and any
  non-obvious mapping decisions (e.g. which field became `department`
  and why).
- **Roadmap** — if this onboarding surfaces a pending decision (a
  duplicate-parent-studio question, a platform not yet generalized,
  data only partially available), record it so it isn't silently lost.
- **Platform documentation** — this document itself, if the new company
  reveals something about a platform's behavior that future onboarding
  should know (e.g. a platform's pagination shape, an auth quirk, a field
  that's inconsistently present).

## RULE 9 — Final Report

Every completed company onboarding must report:

- Official careers source (URL).
- ATS/platform, and how it was confirmed.
- Reusable (config entry) or custom (new file) — and if custom, why.
- Studios/offices discovered, and which field now drives grouping.
- Jobs found / added / updated / closed, from an actual run against the
  real database.
- Duplicate verification result (official_url uniqueness, idempotency
  check).
- Final totals: companies, jobs, active importers.

## RULE 10 — Preserve Official Data

Job Radar is an official-source tracker. Always preserve official data
exactly as provided.

Do **not**:
- Rename studios, offices, or brands.
- Translate locations.
- Guess a country from a city, or a department from a job title.
- Invent salary data.
- Modify titles (including stray leading/trailing whitespace some
  sources include — trim it, don't reword it).

Only normalize data when the normalization is **project-wide,
documented, and consistently applied** — never a one-off fix for a single
company. The normalizations that meet this bar today:

- **Country aliases (matching)** in `frontend/src/utils/englishFocus.ts`
  (`"USA"` / `"US"` / `"United States of America"` → `"united states"`,
  etc.) — used only to decide whether a job's country is on the
  English-focused target list. Applied identically regardless of which
  importer produced the value.
- **Country display normalization (UI-only)** in
  `frontend/src/utils/countries.ts` — a separate, display-only mapping
  (`displayCountry()`) that renders codes/variants as their full country
  name everywhere a country appears (company pages, job cards, and the
  Location filter): `IL → Israel`, `PL → Poland`, `UA → Ukraine`,
  `ES → Spain`, `DE → Germany`, `FR → France`, `CA → Canada`,
  `US` / `USA` / `"United States of America" → United States`,
  `GB` / `UK → United Kingdom`, plus `"Korea, Republic of"` / `"Korea"
  → South Korea` and `"Taiwan, Province of China" → Taiwan` (both
  observed in real imported data). **The database, importers, and stored
  `job.country` / `company.country` values are never touched or
  rewritten** — this only changes what's rendered. A country not
  recognized by this table is shown exactly as stored, never guessed. The
  Location filter groups by this normalized name too, so two raw variants
  of the same country (e.g. a future company using both `"USA"` and
  `"United States of America"`) merge into one filter pill instead of
  splitting the same country across two.
- **Work model normalization** — lower-casing a source's own explicit
  remote/hybrid/on-site value (e.g. Comeet's `workplace_type`), never
  inferring one that isn't stated.

If official data is missing for a field, leave it empty. Do not fill the
gap with a plausible-looking value.

## RULE 11 — No Silent Assumptions

If the official platform does not expose a piece of information:

- Do not infer it from unrelated context.
- Do not scrape a different, unofficial source to fill the gap.
- Do not hardcode a value because "it's probably right."
- Do not guess.

Instead: leave the field empty, document the limitation in the importer
code, and state it plainly in the Rule 9 final report. Two real examples
already on record: Electronic Arts' `work_model` is left unset because
it's only available per-job on ~376 individual detail pages, which isn't
a reasonable cost for a recurring importer — documented, not silently
dropped. Israel Aerospace Industries, Rafael Advanced Defense Systems,
and Simlat remain `unknown` platform because their pages are bot-protected
or client-rendered in a way plain HTTP fetches can't see through — marked
`unknown`, not guessed at.

**Accuracy is always more important than completeness.**

---

This standard applies to every company added from this point forward,
without exception. If a future situation isn't clearly covered by a rule
above, resolve it in the direction of Rule 10 and Rule 11 — preserve
official data exactly, and leave gaps empty rather than fabricate them —
and document the new precedent here.
