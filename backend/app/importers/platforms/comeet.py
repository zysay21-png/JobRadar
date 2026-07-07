import json
import urllib.error
import urllib.request

from app.importers.base import BaseImporter, ImporterFetchError, NormalizedJob
from app.importers.url_normalize import normalize_official_url

COMEET_POSITIONS_URL = (
    "https://www.comeet.co/careers-api/2.0/company/{company_uid}/positions"
    "?token={token}"
)


def fetch_jobs(company_uid: str, token: str) -> list[dict]:
    """Fetch the current open positions from a company's public Comeet
    Careers API (https://developers.comeet.com/reference/careers-api-overview).

    This calls Comeet's public positions endpoint for the given company UID
    and token. It does not scrape HTML and only returns jobs the company
    itself has published through Comeet.
    """
    url = COMEET_POSITIONS_URL.format(company_uid=company_uid, token=token)
    request = urllib.request.Request(url, headers={"User-Agent": "JobRadarImporter/0.1"})

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return json.load(response)
    except (urllib.error.URLError, urllib.error.HTTPError) as exc:
        raise ImporterFetchError(
            f"could not reach Comeet company '{company_uid}': {exc}"
        ) from exc


class ComeetImporter(BaseImporter):
    """Generic importer for any company with a public Comeet Careers API.

    One instance is created per entry in app.importers.config.COMEET_COMPANIES
    — adding a new Comeet-based company only requires a config entry, not a
    new file (see registry.py).
    """

    def __init__(self, company_name: str, company_uid: str, token: str):
        self.company_name = company_name
        self.company_uid = company_uid
        self.token = token

    def fetch_jobs(self) -> list[dict]:
        return fetch_jobs(self.company_uid, self.token)

    def parse_jobs(self, raw: list[dict]) -> list[NormalizedJob]:
        jobs: list[NormalizedJob] = []

        for position in raw:
            title = position.get("name")
            # The official, company-hosted job page, not the Comeet-hosted
            # mirror — this is the real "official URL". Comeet returns a
            # fresh cache-busting/tracking query param (t=, src=, fbclid=)
            # on every fetch of the same posting, so this must go through
            # the shared normalizer before it's ever matched or stored —
            # confirmed root cause of a real duplicate-jobs bug for Moon
            # Active and SuperPlay.
            official_url = normalize_official_url(position.get("url_active_page"))
            if not title or not official_url:
                continue

            location = position.get("location") or {}
            workplace_type = position.get("workplace_type")

            jobs.append(
                NormalizedJob(
                    title=title,
                    official_url=official_url,
                    department=position.get("department"),
                    city=location.get("city"),
                    country=location.get("country"),
                    work_model=workplace_type.lower() if workplace_type else None,
                    # Comeet only exposes a last-updated timestamp, not an
                    # original posting date — leave unset rather than guess.
                    posted_date=None,
                )
            )

        return jobs
