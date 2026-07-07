from abc import ABC, abstractmethod
from datetime import date, datetime
from typing import Any, TypedDict

from app.importers.url_normalize import normalize_official_url
from app.models import Company, Job


class NormalizedJob(TypedDict, total=False):
    """The common shape every importer's parse_jobs() must produce.

    Only fields an importer can genuinely confirm from its source should be
    filled in — leave the rest as None rather than guessing.
    """

    title: str
    official_url: str
    department: str | None
    city: str | None
    country: str | None
    work_model: str | None
    posted_date: date | None


class ImporterFetchError(Exception):
    """Raised when an importer can't reach its official source.

    The runner treats this as a safe per-company skip — never a reason to
    invent or guess job data.
    """


class BaseImporter(ABC):
    """Interface every company importer must implement.

    The runner calls, in order: fetch_jobs() -> parse_jobs(raw) ->
    sync_jobs(db, company, jobs, now). fetch_jobs/parse_jobs are specific to
    each company's official source and must be implemented per importer;
    sync_jobs is the shared add/update/close logic and normally does not
    need to be overridden.
    """

    company_name: str

    @abstractmethod
    def fetch_jobs(self) -> Any:
        """Fetch raw data from the official source (a network call to the
        company's own careers page or its public job-board API). Raise
        ImporterFetchError if the source can't be reached."""
        raise NotImplementedError

    @abstractmethod
    def parse_jobs(self, raw: Any) -> list[NormalizedJob]:
        """Turn the raw payload into a list of NormalizedJob dicts.

        Only real postings found in `raw` — never invent or guess a job
        that isn't actually present in the source data.
        """
        raise NotImplementedError

    def sync_jobs(
        self, db, company: Company, jobs: list[NormalizedJob], now: datetime
    ) -> tuple[int, int, int]:
        """Upsert `jobs` for `company`. Returns (added, updated, closed).

        - A job not already in the database (matched by its canonical
          official_url — see app.importers.url_normalize) is added with
          first_seen = last_checked = now.
        - A job that already exists is updated in place; first_seen is left
          untouched.
        - Any previously-open official job for this company that isn't in
          `jobs` has disappeared from the source and is marked closed
          (never deleted).

        Every importer is expected to already normalize official_url when
        building its NormalizedJob records (see url_normalize.py). It's
        normalized again here regardless — this is the actual match/store
        step, and it must never trust an importer to have done it, since a
        raw, un-normalized URL slipping through here is exactly how
        tracking-parameter duplicates get created.
        """
        added = 0
        updated = 0
        seen_urls: set[str] = set()

        for job in jobs:
            title = job.get("title")
            official_url = normalize_official_url(job.get("official_url"))
            if not title or not official_url:
                continue

            seen_urls.add(official_url)

            existing = (
                db.query(Job)
                .filter(Job.company_id == company.id, Job.official_url == official_url)
                .first()
            )

            if existing:
                existing.title = title
                existing.department = job.get("department")
                existing.city = job.get("city")
                existing.country = job.get("country")
                existing.work_model = job.get("work_model")
                existing.posted_date = job.get("posted_date")
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
                        department=job.get("department"),
                        country=job.get("country"),
                        city=job.get("city"),
                        work_model=job.get("work_model"),
                        experience_level=None,
                        platform=company.platform,
                        official_url=official_url,
                        status="open",
                        posted_date=job.get("posted_date"),
                        first_seen=now,
                        last_checked=now,
                        notes=None,
                        source_type="official",
                        is_verified=True,
                    )
                )
                added += 1

        closed = 0
        still_open = (
            db.query(Job)
            .filter(
                Job.company_id == company.id,
                Job.source_type == "official",
                Job.status == "open",
            )
            .all()
        )
        for existing_job in still_open:
            if existing_job.official_url not in seen_urls:
                existing_job.status = "closed"
                existing_job.last_checked = now
                closed += 1

        db.commit()
        return added, updated, closed
