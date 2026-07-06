import json
import urllib.error
import urllib.parse
import urllib.request

from app.importers.base import BaseImporter, ImporterFetchError, NormalizedJob

# Rockstar's own careers page (rockstargames.com/careers/openings) renders
# its full openings list client-side by calling this GraphQL endpoint with a
# persisted query named "OpeningsData" — a normal HTTP GET, no auth needed.
# Confirmed live on 2026-07-06 by capturing the page's own network traffic.
_VARIABLES = json.dumps({"department": None, "query": None})
_EXTENSIONS = json.dumps(
    {
        "persistedQuery": {
            "version": 1,
            "sha256Hash": "78cbb9ffc82e975403ecb541d89c2914114b6defeabd69337873d67c22baeb1a",
        }
    }
)
ROCKSTAR_GRAPHQL_URL = (
    "https://graph.rockstargames.com/?origin=https://www.rockstargames.com"
    "&operationName=OpeningsData"
    f"&variables={urllib.parse.quote(_VARIABLES)}"
    f"&extensions={urllib.parse.quote(_EXTENSIONS)}"
)

# Rockstar's own site serves each opening at this URL, keyed by the same id
# the GraphQL query returns — confirmed by loading this exact pattern for
# two different job ids and getting the real posting back both times. This
# is also the same URL format already used for the "Senior Gameplay
# Programmer" job seeded earlier, so the importer updates that row instead
# of duplicating it.
ROCKSTAR_JOB_URL = "https://www.rockstargames.com/careers/openings/position/{job_id}"


class RockstarGamesImporter(BaseImporter):
    """Reads Rockstar Games' real, official open positions across all
    Rockstar studios from their own GraphQL openings API."""

    company_name = "Rockstar Games"

    def fetch_jobs(self) -> list[dict]:
        request = urllib.request.Request(
            ROCKSTAR_GRAPHQL_URL, headers={"User-Agent": "JobRadarImporter/0.1"}
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                payload = json.load(response)
        except (urllib.error.URLError, urllib.error.HTTPError) as exc:
            raise ImporterFetchError(
                f"could not reach Rockstar Games' careers page: {exc}"
            ) from exc

        if payload.get("errors"):
            raise ImporterFetchError(
                f"Rockstar Games' careers page returned errors: {payload['errors']}"
            )

        data = payload.get("data") or {}
        return data.get("jobsPositionList") or []

    def parse_jobs(self, raw: list[dict]) -> list[NormalizedJob]:
        jobs: list[NormalizedJob] = []

        for raw_job in raw:
            title = raw_job.get("title")
            job_id = raw_job.get("id")
            if not title or not job_id:
                continue

            # Rockstar's own data has no separate city/country fields — the
            # studio name itself (e.g. "Rockstar North", "Rockstar San
            # Diego") is the real, official location text for the posting,
            # so it's preserved as-is rather than guessing a city/country
            # split that isn't actually in the source.
            studio = raw_job.get("companyName")

            jobs.append(
                NormalizedJob(
                    title=title,
                    official_url=ROCKSTAR_JOB_URL.format(job_id=job_id),
                    department=raw_job.get("department"),
                    city=studio,
                    country=None,
                    work_model=None,
                    posted_date=None,
                )
            )

        return jobs
