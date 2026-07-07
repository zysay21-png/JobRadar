import json
import urllib.error
import urllib.request
from datetime import datetime

from app.importers.base import BaseImporter, ImporterFetchError, NormalizedJob
from app.importers.url_normalize import normalize_official_url

# Gunfire Games' own careers page (gunfiregames.com/careers) links directly
# to their Paylocity Recruiting job board. That page embeds its full job
# list as a JSON object assigned to `window.pageData` right in the page's
# initial HTML — no private API, no headless browser needed, just a normal
# HTTP GET. Confirmed live on 2026-07-06.
GUNFIRE_CAREERS_URL = (
    "https://recruiting.paylocity.com/recruiting/jobs/All/"
    "20e9f03b-0303-4991-9f63-b4dae15d620f/Gunfire-Games"
)
# The individual job page pattern, confirmed by rendering the page and
# checking the actual link href generated for each listed job.
GUNFIRE_JOB_DETAIL_URL = "https://recruiting.paylocity.com/Recruiting/Jobs/Details/{job_id}"

_PAGE_DATA_MARKER = "window.pageData = "


def _parse_published_date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).date()
    except ValueError:
        return None


class GunfireGamesImporter(BaseImporter):
    """Reads Gunfire Games' real, official open positions from their
    Paylocity Recruiting job board."""

    company_name = "Gunfire Games"

    def fetch_jobs(self) -> dict:
        request = urllib.request.Request(
            GUNFIRE_CAREERS_URL,
            headers={"User-Agent": "Mozilla/5.0 (compatible; JobRadarImporter/0.1)"},
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                html = response.read().decode("utf-8", errors="replace")
        except (urllib.error.URLError, urllib.error.HTTPError) as exc:
            raise ImporterFetchError(
                f"could not reach Gunfire Games' careers page: {exc}"
            ) from exc

        marker_index = html.find(_PAGE_DATA_MARKER)
        if marker_index == -1:
            raise ImporterFetchError(
                "Gunfire Games' careers page no longer has the expected job data"
            )

        json_start = marker_index + len(_PAGE_DATA_MARKER)
        try:
            page_data, _ = json.JSONDecoder().raw_decode(html[json_start:])
        except json.JSONDecodeError as exc:
            raise ImporterFetchError(
                f"could not parse Gunfire Games' job data: {exc}"
            ) from exc

        return page_data

    def parse_jobs(self, raw: dict) -> list[NormalizedJob]:
        jobs: list[NormalizedJob] = []

        for raw_job in raw.get("Jobs", []):
            title = raw_job.get("JobTitle")
            job_id = raw_job.get("JobId")
            if not title or not job_id:
                continue

            location = raw_job.get("JobLocation") or {}

            jobs.append(
                NormalizedJob(
                    title=title,
                    official_url=normalize_official_url(
                        GUNFIRE_JOB_DETAIL_URL.format(job_id=job_id)
                    ),
                    department=raw_job.get("HiringDepartment"),
                    city=raw_job.get("LocationName"),
                    country=location.get("Country"),
                    # IsRemote is a real, explicit boolean from the source —
                    # only set "remote" when true; don't guess onsite/hybrid
                    # when it's false, since that's not actually confirmed.
                    work_model="remote" if raw_job.get("IsRemote") else None,
                    posted_date=_parse_published_date(raw_job.get("PublishedDate")),
                )
            )

        return jobs
