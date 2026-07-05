from datetime import datetime

from app.database import SessionLocal
from app.importers.config import GREENHOUSE_COMPANIES
from app.importers.greenhouse import GreenhouseFetchError, fetch_jobs
from app.models import Company, Job


def parse_posted_date(raw_job: dict):
    first_published = raw_job.get("first_published")
    if not first_published:
        return None
    try:
        return datetime.fromisoformat(first_published).date()
    except ValueError:
        return None


def import_company_jobs(db, company: Company, board_token: str) -> tuple[int, int, int]:
    raw_jobs = fetch_jobs(board_token)
    print(f"  Jobs found: {len(raw_jobs)}")

    added = 0
    updated = 0
    now = datetime.utcnow()

    for raw_job in raw_jobs:
        title = raw_job.get("title")
        official_url = raw_job.get("absolute_url")
        if not title or not official_url:
            continue

        departments = raw_job.get("departments") or []
        department = departments[0]["name"] if departments else None

        location = raw_job.get("location") or {}
        city = location.get("name")

        posted_date = parse_posted_date(raw_job)

        existing = (
            db.query(Job)
            .filter(Job.company_id == company.id, Job.official_url == official_url)
            .first()
        )

        if existing:
            existing.title = title
            existing.department = department
            existing.city = city
            existing.posted_date = posted_date
            existing.status = "open"
            existing.source_type = "official"
            existing.is_verified = True
            existing.last_checked = now
            updated += 1
        else:
            db.add(
                Job(
                    company_id=company.id,
                    title=title,
                    department=department,
                    country=None,
                    city=city,
                    work_model=None,
                    experience_level=None,
                    platform=company.platform,
                    official_url=official_url,
                    status="open",
                    posted_date=posted_date,
                    last_checked=now,
                    notes=None,
                    source_type="official",
                    is_verified=True,
                )
            )
            added += 1

    db.commit()
    return len(raw_jobs), added, updated


def run_all(db) -> dict:
    """Run every configured importer against the given db session.

    Returns a summary dict used both by the CLI entry point and the
    POST /importers/run API endpoint, so the two stay in sync.
    """
    summary = {
        "companies_checked": 0,
        "jobs_found": 0,
        "jobs_added": 0,
        "jobs_updated": 0,
        "errors": [],
    }

    if not GREENHOUSE_COMPANIES:
        print("No companies configured for Greenhouse import yet.")
        print(
            "Add an entry to app/importers/config.py once a company's public "
            "Greenhouse board token has been confirmed."
        )
        return summary

    for company_name, board_token in GREENHOUSE_COMPANIES.items():
        print(f"\nChecking {company_name} (Greenhouse board: {board_token})...")
        summary["companies_checked"] += 1

        company = db.query(Company).filter(Company.name == company_name).first()
        if not company:
            message = f"'{company_name}' not found in companies table."
            print(f"  Skipped: {message}")
            summary["errors"].append(message)
            continue

        try:
            found, added, updated = import_company_jobs(db, company, board_token)
        except GreenhouseFetchError as exc:
            print(f"  Skipped: {exc}")
            summary["errors"].append(str(exc))
            continue

        print(f"  Jobs added: {added}")
        print(f"  Jobs updated: {updated}")
        summary["jobs_found"] += found
        summary["jobs_added"] += added
        summary["jobs_updated"] += updated

    return summary


def run():
    """CLI entry point: `python -m app.importers.run_importers`"""
    db = SessionLocal()
    try:
        run_all(db)
    finally:
        db.close()


if __name__ == "__main__":
    run()
