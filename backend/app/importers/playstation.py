import http.cookiejar
import json
import urllib.error
import urllib.request

from app.importers.base import BaseImporter, ImporterFetchError, NormalizedJob

# PlayStation's own careers site (careers.playstation.com/jobs) is a Paradox
# ("Olivia") career site. The page itself calls this same-origin, official
# PlayStation endpoint to fetch each page of results — confirmed by
# capturing the site's own network traffic while paging through results.
# It requires a session cookie (issued by a normal GET of the jobs page)
# and a Referer header; both were confirmed necessary by testing without
# them (403/500). No private/undocumented auth — this is the same request
# the public site makes itself. Confirmed live on 2026-07-06.
CAREERS_PAGE_URL = "https://careers.playstation.com/jobs"
JOBS_API_URL = (
    "https://careers.playstation.com/api/get-jobs"
    "?radius=15&page_number={page}&enable_kilometers=false"
)
JOBS_API_BODY = json.dumps(
    {
        "disable_switch_search_mode": False,
        "site_available_languages": ["fr-ca", "ja", "en", "en-us"],
    }
).encode("utf-8")

# PlayStation's own site serves each job at this URL — confirmed by reading
# the real rendered <a href> values on the careers page for several jobs.
JOB_URL_TEMPLATE = "https://careers.playstation.com/{original_url}"

_PAGE_SIZE = 50
_MAX_PAGES = 20  # safety cap; real catalog is ~7 pages at 50/page


class PlayStationImporter(BaseImporter):
    """Reads Sony Interactive Entertainment / PlayStation's real, official
    open positions across all PlayStation studios and offices."""

    company_name = "Sony Interactive Entertainment"

    def fetch_jobs(self) -> list[dict]:
        cookie_jar = http.cookiejar.CookieJar()
        opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(cookie_jar)
        )
        headers = {
            "User-Agent": "JobRadarImporter/0.1",
            "Referer": CAREERS_PAGE_URL,
        }

        try:
            opener.open(
                urllib.request.Request(CAREERS_PAGE_URL, headers=headers), timeout=10
            )
        except (urllib.error.URLError, urllib.error.HTTPError) as exc:
            raise ImporterFetchError(
                f"could not reach PlayStation's careers page: {exc}"
            ) from exc

        all_jobs: list[dict] = []
        total_jobs = None

        for page in range(1, _MAX_PAGES + 1):
            request = urllib.request.Request(
                JOBS_API_URL.format(page=page),
                data=JOBS_API_BODY,
                headers={**headers, "Content-Type": "application/json"},
                method="POST",
            )
            try:
                with opener.open(request, timeout=10) as response:
                    payload = json.load(response)
            except (urllib.error.URLError, urllib.error.HTTPError) as exc:
                raise ImporterFetchError(
                    f"could not reach PlayStation's job listing API: {exc}"
                ) from exc

            page_jobs = payload.get("jobs") or []
            if not page_jobs:
                break

            all_jobs.extend(page_jobs)
            total_jobs = payload.get("totalJob")
            if total_jobs is not None and len(all_jobs) >= total_jobs:
                break

        return all_jobs

    def parse_jobs(self, raw: list[dict]) -> list[NormalizedJob]:
        jobs: list[NormalizedJob] = []

        for raw_job in raw:
            title = raw_job.get("title")
            original_url = raw_job.get("originalURL")
            if not title or not original_url:
                continue

            locations = raw_job.get("locations") or []
            location = locations[0] if locations else {}

            jobs.append(
                NormalizedJob(
                    title=title.strip(),
                    official_url=JOB_URL_TEMPLATE.format(original_url=original_url),
                    # The studio/legal entity that owns the role (e.g.
                    # "Naughty Dog", "Insomniac Games", "Sucker Punch
                    # Productions, LLC") — preserved exactly as PlayStation's
                    # own data labels it.
                    department=raw_job.get("brandName"),
                    city=location.get("city"),
                    country=location.get("country"),
                    work_model="remote" if raw_job.get("isRemote") else None,
                    posted_date=None,
                )
            )

        return jobs
