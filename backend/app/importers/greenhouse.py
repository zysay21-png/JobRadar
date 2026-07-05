import json
import urllib.error
import urllib.request

GREENHOUSE_JOBS_URL = "https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true"


class GreenhouseFetchError(Exception):
    pass


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
        raise GreenhouseFetchError(
            f"could not reach Greenhouse board '{board_token}': {exc}"
        ) from exc

    return payload.get("jobs", [])
