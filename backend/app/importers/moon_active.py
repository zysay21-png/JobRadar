import json
import urllib.error
import urllib.request

from app.importers.base import BaseImporter, ImporterFetchError, NormalizedJob

# Moon Active's own careers page (moonactive.com/careers) renders its job
# list client-side using Comeet's public Careers API
# (https://developers.comeet.com/reference/careers-api-overview).
#
# COMEET_TOKEN below is not a secret: it's embedded directly in the HTML of
# moonactive.com/hot-positions/ and used by Moon Active's own site to fetch
# this same data client-side. Confirmed live on 2026-07-05.
COMEET_COMPANY_UID = "A2.00C"
COMEET_TOKEN = "2ACD5C02AC10081008AB01560180C804"
COMEET_POSITIONS_URL = (
    f"https://www.comeet.co/careers-api/2.0/company/{COMEET_COMPANY_UID}/positions"
    f"?token={COMEET_TOKEN}"
)


class MoonActiveImporter(BaseImporter):
    """Reads Moon Active's real, official open positions from Comeet."""

    company_name = "Moon Active"

    def fetch_jobs(self) -> list[dict]:
        request = urllib.request.Request(
            COMEET_POSITIONS_URL, headers={"User-Agent": "JobRadarImporter/0.1"}
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                return json.load(response)
        except (urllib.error.URLError, urllib.error.HTTPError) as exc:
            raise ImporterFetchError(
                f"could not reach Moon Active's careers page: {exc}"
            ) from exc

    def parse_jobs(self, raw: list[dict]) -> list[NormalizedJob]:
        jobs: list[NormalizedJob] = []

        for position in raw:
            title = position.get("name")
            # The official, company-hosted job page (moonactive.com), not
            # the Comeet-hosted mirror — this is the real "official URL".
            official_url = position.get("url_active_page")
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
