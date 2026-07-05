from datetime import datetime

from app.importers.base import ImporterFetchError
from app.importers.registry import get_importers
from app.models import Company, ImporterState


def run_all(db) -> dict:
    """Run every registered importer against the given db session.

    Returns a summary dict used both by the CLI entry point
    (app/importers/run_importers.py) and the POST /importers/run API
    endpoint, so the two stay in sync.

    All jobs touched in this run share one `now` timestamp, and that same
    timestamp is persisted as ImporterState.last_refresh_at. That means a
    newly added job's first_seen exactly equals the run's refreshed_at —
    which is how "new since last check" is computed on the frontend, with
    no separate bookkeeping needed.
    """
    now = datetime.utcnow()

    summary = {
        "companies_checked": 0,
        "companies_skipped": 0,
        "jobs_found": 0,
        "jobs_added": 0,
        "jobs_updated": 0,
        "jobs_closed": 0,
        "errors": [],
        "refreshed_at": now,
    }

    for importer in get_importers():
        print(f"\nChecking {importer.company_name}...")
        summary["companies_checked"] += 1

        company = db.query(Company).filter(Company.name == importer.company_name).first()
        if not company:
            message = f"'{importer.company_name}' not found in companies table."
            print(f"  Skipped: {message}")
            summary["companies_skipped"] += 1
            summary["errors"].append(message)
            continue

        try:
            raw = importer.fetch_jobs()
            jobs = importer.parse_jobs(raw)
        except ImporterFetchError as exc:
            print(f"  Skipped: {exc}")
            summary["companies_skipped"] += 1
            summary["errors"].append(str(exc))
            continue

        print(f"  Jobs found: {len(jobs)}")
        added, updated, closed = importer.sync_jobs(db, company, jobs, now)
        print(f"  Jobs added: {added}")
        print(f"  Jobs updated: {updated}")
        print(f"  Jobs closed: {closed}")

        summary["jobs_found"] += len(jobs)
        summary["jobs_added"] += added
        summary["jobs_updated"] += updated
        summary["jobs_closed"] += closed

    # Always record that a refresh attempt happened, even if every importer
    # was skipped — this is what "new since last check" is measured
    # against, and it should still advance so a stale run isn't confused
    # for a fresh one.
    state = db.query(ImporterState).filter(ImporterState.id == 1).first()
    if not state:
        state = ImporterState(id=1)
        db.add(state)
    state.last_refresh_at = now
    db.commit()

    return summary
