import html
import json
import re
import urllib.error
import urllib.request

from app.importers.base import BaseImporter, ImporterFetchError, NormalizedJob
from app.importers.url_normalize import normalize_official_url

# Riot's own careers page (riotgames.com/en/work-with-us/jobs) embeds its
# full, current job list directly in the page's initial HTML — no separate
# XHR/API call. It's a `data-props="{...}"` attribute (HTML-entity-escaped
# JSON) on the job-list widget's wrapper div, confirmed by fetching the page
# with a plain curl (no JS execution) and finding all 166 currently-listed
# jobs present in that one attribute. A normal HTTP GET, no auth needed.
# Confirmed live on 2026-07-06.
RIOT_JOBS_URL = "https://www.riotgames.com/en/work-with-us/jobs"
_DATA_PROPS_MARKER = 'data-props="{&quot;jobs&quot;'

# Riot's own site serves each job at this URL, keyed by the numeric id
# embedded in the data-props "url" field (e.g. "/j/7844349") — confirmed by
# following the real redirect chain for that exact job (this short URL
# 302s to the full slugged job page) and by clicking the equivalent
# rendered link on the live page.
RIOT_JOB_URL = "https://www.riotgames.com/en/j/{job_id}"

_JOB_ID_RE = re.compile(r"(\d+)$")


class RiotGamesImporter(BaseImporter):
    """Reads Riot Games' real, official open positions and preserves its
    office/product-team structure from its own careers page."""

    company_name = "Riot Games"

    def fetch_jobs(self) -> list[dict]:
        request = urllib.request.Request(
            RIOT_JOBS_URL, headers={"User-Agent": "JobRadarImporter/0.1"}
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                page_html = response.read().decode("utf-8", errors="replace")
        except (urllib.error.URLError, urllib.error.HTTPError) as exc:
            raise ImporterFetchError(
                f"could not reach Riot Games' careers page: {exc}"
            ) from exc

        marker_index = page_html.find(_DATA_PROPS_MARKER)
        if marker_index == -1:
            raise ImporterFetchError(
                "Riot Games' careers page no longer has the expected job data"
            )

        attr_start = page_html.find('"', marker_index + len("data-props=")) + 1
        attr_end = page_html.find('"', attr_start)
        if attr_start == 0 or attr_end == -1:
            raise ImporterFetchError(
                "could not parse Riot Games' job data attribute"
            )

        decoded = html.unescape(page_html[attr_start:attr_end])
        try:
            payload = json.loads(decoded)
        except json.JSONDecodeError as exc:
            raise ImporterFetchError(
                f"could not parse Riot Games' job data: {exc}"
            ) from exc

        return payload.get("jobs") or []

    def parse_jobs(self, raw: list[dict]) -> list[NormalizedJob]:
        jobs: list[NormalizedJob] = []

        for raw_job in raw:
            title = (raw_job.get("title") or "").strip()
            job_path = raw_job.get("url")
            if not title or not job_path:
                continue

            id_match = _JOB_ID_RE.search(job_path)
            if not id_match:
                continue
            job_id = id_match.group(1)

            city, country = self._split_office(raw_job.get("office"))

            jobs.append(
                NormalizedJob(
                    title=title,
                    official_url=normalize_official_url(
                        RIOT_JOB_URL.format(job_id=job_id)
                    ),
                    # Riot organizes roles around product/game teams (e.g.
                    # "VALORANT", "League of Legends", "Riftbound", "Esports",
                    # "Riot Operations & Support") rather than separate
                    # studios — this is Riot's real equivalent of a studio
                    # grouping, preserved exactly as their own "products"
                    # field provides it. Riot's separate functional
                    # "craft" field (e.g. "Software Engineering Group",
                    # "Design") is real too, but the Job model has only one
                    # department-like slot, and the product/team grouping is
                    # what "office/studio grouping" is asking for here.
                    department=raw_job.get("products"),
                    city=city,
                    country=country,
                    # Not present anywhere in Riot's job list data or on
                    # individual job pages — left unset rather than guessed.
                    work_model=None,
                    posted_date=None,
                )
            )

        return jobs

    @staticmethod
    def _split_office(office: str | None) -> tuple[str | None, str | None]:
        if not office:
            return None, None
        office = html.unescape(office.strip())
        if "," not in office:
            # City-state offices (currently only "Singapore") are given as
            # a single value with no separate country — treated as the
            # country since that's the unambiguous, commonly-used name.
            return None, office
        city, country = office.split(",", 1)
        return city.strip(), country.strip()
