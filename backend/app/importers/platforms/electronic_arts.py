import html
import re
import urllib.error
import urllib.request

from app.importers.base import BaseImporter, ImporterFetchError, NormalizedJob
from app.importers.url_normalize import normalize_official_url

# EA's own careers site (ea.com/careers -> jobs.ea.com) is a SAP
# SuccessFactors Recruiting career site. Its search results page is
# server-rendered plain HTML (confirmed via a plain curl with no JS
# execution), paginated via jobOffset/jobRecordsPerPage query params — a
# normal HTTP GET, no auth, no session cookie required. Confirmed live on
# 2026-07-06.
EA_SEARCH_URL = (
    "https://jobs.ea.com/en_US/careers/SearchJobs/"
    "?jobRecordsPerPage={page_size}&jobOffset={offset}"
)
_PAGE_SIZE = 20
_MAX_PAGES = 40  # safety cap; catalog is currently ~19 pages at 20/page

_ARTICLE_SPLIT_RE = re.compile(r'<article class="article article--result')
_TITLE_RE = re.compile(r'link_result" href="([^"]+)"[^>]*>\s*([^<]+?)\s*</a>')
_ID_RE = re.compile(r'list-item-id">Role ID (\d+)</span>')
_LOCATION_RE = re.compile(r'list-item-location">([^<]*)</span>')
_DEPARTMENT_RE = re.compile(r'list-item-department">([^<]*)</span>')


class ElectronicArtsImporter(BaseImporter):
    """Reads Electronic Arts' real, official open positions across all EA
    studios from their own SuccessFactors career site search results."""

    company_name = "Electronic Arts"

    def fetch_jobs(self) -> list[dict]:
        raw_jobs: list[dict] = []
        seen_ids: set[str] = set()

        for page in range(_MAX_PAGES):
            offset = page * _PAGE_SIZE
            url = EA_SEARCH_URL.format(page_size=_PAGE_SIZE, offset=offset)
            request = urllib.request.Request(url, headers={"User-Agent": "JobRadarImporter/0.1"})
            try:
                with urllib.request.urlopen(request, timeout=10) as response:
                    page_html = response.read().decode("utf-8", errors="replace")
            except (urllib.error.URLError, urllib.error.HTTPError) as exc:
                raise ImporterFetchError(
                    f"could not reach EA's careers search page: {exc}"
                ) from exc

            articles = _ARTICLE_SPLIT_RE.split(page_html)[1:]
            if not articles:
                break

            found_new = False
            for article in articles:
                title_match = _TITLE_RE.search(article)
                id_match = _ID_RE.search(article)
                if not title_match or not id_match:
                    continue

                job_id = id_match.group(1)
                if job_id in seen_ids:
                    continue
                seen_ids.add(job_id)
                found_new = True

                location_match = _LOCATION_RE.search(article)
                department_match = _DEPARTMENT_RE.search(article)

                raw_jobs.append(
                    {
                        "id": job_id,
                        "url": title_match.group(1),
                        "title": title_match.group(2),
                        "location": location_match.group(1).strip() if location_match else None,
                        "department": department_match.group(1).strip()
                        if department_match
                        else None,
                    }
                )

            if not found_new:
                break

        return raw_jobs

    def parse_jobs(self, raw: list[dict]) -> list[NormalizedJob]:
        jobs: list[NormalizedJob] = []

        for raw_job in raw:
            title = raw_job.get("title")
            official_url = normalize_official_url(raw_job.get("url"))
            if not title or not official_url:
                continue

            city, country = self._split_location(raw_job.get("location"))

            jobs.append(
                NormalizedJob(
                    title=html.unescape(title),
                    official_url=official_url,
                    # EA's own site calls this field "Studio/Department" and
                    # already distinguishes real studios from corporate
                    # functions via its own naming convention, e.g.
                    # "EA Studios - Respawn", "EA Studios - Criterion Games",
                    # "EA Studios - DICE Stockholm", "EA Studios - Motive
                    # Montreal", "EA Studios - BioWare", "Maxis", vs. plain
                    # corporate categories like "Marketing", "CT - IT",
                    # "Finance". Stored exactly as EA provides it.
                    department=html.unescape(raw_job["department"])
                    if raw_job.get("department")
                    else None,
                    city=city,
                    country=country,
                    # EA's search results list doesn't include work model;
                    # it's only shown on each job's individual detail page.
                    # Fetching all ~376 detail pages just for that one
                    # optional field isn't a reasonable tradeoff for a
                    # recurring importer, so it's left unset rather than
                    # guessed.
                    work_model=None,
                    # No reliable "date posted" field is exposed either in
                    # the search results or on individual job pages.
                    posted_date=None,
                )
            )

        return jobs

    @staticmethod
    def _split_location(location: str | None) -> tuple[str | None, str | None]:
        if not location:
            return None, None
        # EA's location strings are "City, Country" — but some countries'
        # own official names contain a comma (e.g. "Seoul, Korea, Republic
        # of"), so splitting on the *first* comma (not the last) is what
        # correctly separates city from the full country name in all
        # observed cases.
        if "," not in location:
            return html.unescape(location.strip()), None
        city, country = location.split(",", 1)
        return html.unescape(city.strip()), html.unescape(country.strip())
