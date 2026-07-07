import json
import urllib.error
import urllib.request
from datetime import datetime

from app.importers.base import BaseImporter, ImporterFetchError, NormalizedJob
from app.importers.url_normalize import normalize_official_url

# ArenaNet's own careers page (arena.net/en/careers) renders its job list
# client-side using Ashby's public job board API
# (https://api.ashbyhq.com/posting-api/job-board/arenanet) — a normal HTTP
# GET, no auth needed. Confirmed live on 2026-07-06.
ASHBY_JOBS_URL = "https://api.ashbyhq.com/posting-api/job-board/arenanet?content=true"

# ArenaNet's own site serves each job at this URL, keyed by the same id
# Ashby returns — confirmed by loading this exact pattern for two different
# job ids and getting the real posting back both times. This is also the
# same URL format already used for the "Senior Technical Artist (Contract)"
# job seeded earlier, so the importer updates that row instead of
# duplicating it.
ARENANET_JOB_URL = "https://www.arena.net/en/careers/job/{job_id}"


def _parse_published_date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).date()
    except ValueError:
        return None


class ArenaNetImporter(BaseImporter):
    """Reads ArenaNet's real, official open positions from Ashby."""

    company_name = "ArenaNet"

    def fetch_jobs(self) -> list[dict]:
        request = urllib.request.Request(
            ASHBY_JOBS_URL, headers={"User-Agent": "JobRadarImporter/0.1"}
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                payload = json.load(response)
        except (urllib.error.URLError, urllib.error.HTTPError) as exc:
            raise ImporterFetchError(
                f"could not reach ArenaNet's careers page: {exc}"
            ) from exc

        return payload.get("jobs", [])

    def parse_jobs(self, raw: list[dict]) -> list[NormalizedJob]:
        jobs: list[NormalizedJob] = []

        for raw_job in raw:
            # "General Applications" (department "All") is a standing,
            # years-old catch-all resume drop, not an actual open role —
            # every other real posting has a specific department/team.
            if raw_job.get("department") == "All":
                continue

            title = raw_job.get("title")
            job_id = raw_job.get("id")
            if not title or not job_id:
                continue

            address = (raw_job.get("address") or {}).get("postalAddress") or {}
            workplace_type = raw_job.get("workplaceType")

            jobs.append(
                NormalizedJob(
                    title=title.strip(),
                    official_url=normalize_official_url(
                        ARENANET_JOB_URL.format(job_id=job_id)
                    ),
                    department=raw_job.get("department"),
                    city=raw_job.get("location"),
                    country=address.get("addressCountry"),
                    work_model=workplace_type.lower() if workplace_type else None,
                    posted_date=_parse_published_date(raw_job.get("publishedAt")),
                )
            )

        return jobs
