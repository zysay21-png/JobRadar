# Importers

> **Before adding a new company:** read
> [`docs/COMPANY_ONBOARDING_STANDARD.md`](../../../docs/COMPANY_ONBOARDING_STANDARD.md)
> first. It's the mandatory research → build → verify → report workflow for
> every company, importer, and platform added to Job Radar — covering ATS
> detection, reuse vs. new-platform vs. custom decisions, the
> one-parent-company rule (and the real Bungie/PlayStation-studio duplicate
> trap), required verification steps, and the "never invent missing data"
> rule. This file below explains the current folder structure; the
> standard explains the process for changing it.
>
> For how imported data is *displayed* once it's in the database (country
> name formatting, location cleanup, job card/company page structure), see
> [`docs/UI_DISPLAY_STANDARD.md`](../../../docs/UI_DISPLAY_STANDARD.md) —
> the frontend's equivalent permanent standard. Importers never format for
> display; they only preserve official data (Rule 1 there mirrors Rule 10
> here).
>
> For the canonical shape of every data field (countries, states, cities,
> URLs, dates, company/studio/department names), see
> [`docs/DATA_STANDARDS.md`](../../../docs/DATA_STANDARDS.md) — the single
> project-wide reference both of the documents above must agree with.

Every importer implements `BaseImporter` (`base.py`): `fetch_jobs()` gets raw
data from a company's official source, `parse_jobs()` turns it into
`NormalizedJob` records, and the shared `sync_jobs()` does the add/update/
close-on-disappear logic identically for all of them. `registry.py` is the
single place that lists which importers actually run; `runner.py` executes
them all and produces the refresh summary the API and frontend use.

## `official_url` must always be canonicalized

Every `NormalizedJob.official_url` a `parse_jobs()` produces must be passed
through `normalize_official_url()` (`url_normalize.py`) before it's returned
— never build or match on a raw URL. Some sources (confirmed: Comeet's
`url_active_page`, used by Moon Active and SuperPlay) return a different
cache-busting or tracking query parameter (`t=`, `src=`, `fbclid=`, ...) on
every fetch of the *same* posting; without normalization, `sync_jobs()`'s
exact-string dedupe treats each re-scrape as a brand-new job. This is a
confirmed real bug that created 15 duplicate rows before this normalizer
existed.

`normalize_official_url()` only strips a fixed set of known
tracking/cache-busting parameters (UTM params, `fbclid`, `gclid`, session
ids, timestamps, ...). It never touches a parameter that identifies the job
itself (`gh_jid`, `uid`, `jobId`, ...) — when adding a new importer, if its
source uses a job-identifying query parameter not already in
`TRACKING_QUERY_PARAMS`' complement (i.e. it isn't in that blocklist), it's
preserved automatically; just don't add a real job identifier to the
blocklist.

`sync_jobs()` also normalizes `official_url` again itself as a backstop —
so even if a `parse_jobs()` implementation forgets, matching/storage still
uses the canonical form — but every importer should normalize at the source
too, so the URL is already canonical before `sync_jobs()` ever sees it.

Importers live in one of two folders, depending on what's actually behind
the company's careers page — not on how much code has been written yet:

```
importers/
├── platforms/   — backed by a real, reusable third-party ATS
├── custom/      — backed by a company's own proprietary system
├── base.py      — shared interface + sync_jobs()
├── config.py    — per-company config for config-driven platform importers
├── registry.py  — the list of importers that actually run
└── runner.py    — executes them all, used by the API and the CLI
```

## `platforms/`

Each file here is backed by a real, off-the-shelf ATS product — meaning
more than one company could plausibly use the exact same code. Two shapes
currently coexist in this folder:

- **Config-driven** (`greenhouse.py`, `comeet.py`): one importer *class*,
  any number of companies. Adding a company is a config entry in
  `config.py` — no new file, no code change. This is the end state every
  platform importer should eventually reach.
- **Single-company, pending generalization** (`arenanet.py` — Ashby,
  `gunfire_games.py` — Paylocity, `electronic_arts.py` — SAP
  SuccessFactors): today, exactly one confirmed company sits on each of
  these platforms, so the class is still hardcoded to that one company.
  They live in `platforms/`, not `custom/`, because the *platform* is
  reusable even though the *code* hasn't been generalized yet — Greenhouse
  and Comeet both went through this same single-company phase before being
  refactored (see the Moon Active → Comeet refactor for the template).

Generalize one of these the moment a **second** confirmed company shows up
on the same platform — that's the trigger, not a fixed schedule. Until
then, adding a second company to an ungeneralized platform means writing a
second single-company file, exactly as `custom/` companies are added.

## `custom/`

Each file here (`rockstar_games.py`, `playstation.py`, `riot_games.py`) is
backed by a company's own in-house, proprietary careers system — not a
third-party ATS at all. There is nothing to generalize: one file per
company, permanently. A new company only goes here if its careers page
turns out to run on its own bespoke system with no real third-party ATS
underneath it.

## Adding a new company

1. **It's on Greenhouse or Comeet already:** add one entry to
   `GREENHOUSE_COMPANIES` / `COMEET_COMPANIES` in `config.py`. Done — no
   new file, no change to `registry.py`.
2. **It's on Ashby, Paylocity, or SAP SuccessFactors:** you now have a
   second confirmed company on that platform — generalize the existing
   single-company file into a config-driven class first (same shape as the
   Comeet refactor), add a `<PLATFORM>_COMPANIES` dict to `config.py`, then
   add the company as a config entry.
3. **It's on some other platform not listed above:** confirm the platform
   from the company's own careers page (never guess), write
   `platforms/<company>.py` implementing `BaseImporter`
   (`platforms/arenanet.py` is a good single-company template), and add one
   line to `registry.py`.
4. **It runs its own proprietary careers system:** write
   `custom/<company>.py` implementing `BaseImporter`
   (`custom/rockstar_games.py` is a good template), and add one line to
   `registry.py`.

In every case, `sync_jobs()` in `base.py` handles matching by canonical
`official_url`, updating existing jobs, and marking disappeared jobs
`closed` — importer code only ever needs to implement `fetch_jobs()` and
`parse_jobs()`, passing every `official_url` through
`normalize_official_url()` before returning it (see above).
