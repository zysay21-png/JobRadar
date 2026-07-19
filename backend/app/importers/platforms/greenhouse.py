import json
import urllib.error
import urllib.request
from datetime import datetime

from app.importers.base import BaseImporter, ImporterFetchError, NormalizedJob
from app.importers.url_normalize import normalize_official_url

GREENHOUSE_JOBS_URL = "https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true"


def fetch_jobs(board_token: str) -> list[dict]:
    """Fetch the current open jobs from a company's public Greenhouse job board.

    This calls Greenhouse's public, documented job board API for the given
    board token. It does not scrape HTML and only returns jobs the company
    itself has published on that board.
    """
    url = GREENHOUSE_JOBS_URL.format(board_token=board_token)
    request = urllib.request.Request(url, headers={"User-Agent": "JobRadarImporter/0.1"})

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            payload = json.load(response)
    except (urllib.error.URLError, urllib.error.HTTPError) as exc:
        raise ImporterFetchError(
            f"could not reach Greenhouse board '{board_token}': {exc}"
        ) from exc

    return payload.get("jobs", [])


def parse_posted_date(raw_job: dict):
    first_published = raw_job.get("first_published")
    if not first_published:
        return None
    try:
        return datetime.fromisoformat(first_published).date()
    except ValueError:
        return None


class GreenhouseImporter(BaseImporter):
    """Generic importer for any company with a public Greenhouse board.

    One instance is created per entry in app.importers.config.GREENHOUSE_COMPANIES
    — adding a new Greenhouse-based company only requires a config entry,
    not a new file (see registry.py).
    """

    def __init__(
        self, company_name: str, board_token: str, prefer_offices_for_city: bool = False
    ):
        self.company_name = company_name
        self.board_token = board_token
        # Greenhouse's free-text `location.name` is normally the more
        # reliable field, but on some boards it's inconsistent (a bare
        # country name for some jobs, a real city for others, a
        # semicolon-joined multi-city string for others) while the
        # structured `offices[]` array gives clean, real per-job office
        # names instead. This is NOT true for every Greenhouse board —
        # confirmed by direct comparison: Epic Games' `offices[]` is a
        # static default (always its Cary, NC HQ) that disagrees with the
        # real per-job location on 82 of ~127 jobs, so using it there
        # would be a regression. Playtika's `offices[]`, by contrast, was
        # confirmed to vary correctly per job (Herzliya, Las Vegas,
        # Warsaw, Bucharest, Kyiv, and genuine multi-office lists) and is
        # strictly better than its own noisy `location.name`. This flag
        # must only be set after that same kind of direct verification for
        # a given company — never assumed.
        self.prefer_offices_for_city = prefer_offices_for_city

    def fetch_jobs(self) -> list[dict]:
        return fetch_jobs(self.board_token)

    def parse_jobs(self, raw: list[dict]) -> list[NormalizedJob]:
        jobs: list[NormalizedJob] = []

        for raw_job in raw:
            title = raw_job.get("title")
            official_url = normalize_official_url(raw_job.get("absolute_url"))
            if not title or not official_url:
                continue

            departments = raw_job.get("departments") or []
            department = departments[0]["name"] if departments else None

            location = raw_job.get("location") or {}
            city = location.get("name")

            if self.prefer_offices_for_city:
                offices = [
                    office["name"]
                    for office in (raw_job.get("offices") or [])
                    if office.get("name")
                ]
                if offices:
                    city = ", ".join(offices)

            jobs.append(
                NormalizedJob(
                    title=title,
                    official_url=official_url,
                    department=department,
                    city=city,
                    # Greenhouse's location is one free-text string, not
                    # structured city/country — don't split/guess it.
                    country=None,
                    work_model=None,
                    posted_date=parse_posted_date(raw_job),
                )
            )

        return jobs
