from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

# Query parameters known to be tracking/cache-busting noise that never
# identify the job itself — safe to strip from any importer's official URL.
#
# Do NOT add a parameter here unless it's confirmed to carry no job
# identity anywhere in the app. In particular, `gh_jid` (Greenhouse),
# `uid` (Comeet), `jobId`/`job_id`/`positionId`/`requisitionId`/`id` are
# real job identifiers on some sources and must never be stripped.
TRACKING_QUERY_PARAMS = {
    # cache-busting / re-scrape timestamps
    "t", "ts", "timestamp", "_", "cb", "cachebust", "cache_bust", "nocache",
    # UTM / campaign tracking
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    # ad-network click identifiers
    "fbclid", "gclid", "msclkid",
    # generic referral/source markers
    "ref", "referrer", "source", "src",
    # session identifiers
    "sessionid", "session_id", "phpsessid", "jsessionid", "sid",
}


def normalize_official_url(url: str | None) -> str | None:
    """Return the canonical form of an official job posting URL.

    Strips only the query parameters listed in TRACKING_QUERY_PARAMS,
    drops any fragment, and lowercases the scheme/host (case-insensitive
    per the URL spec). Everything else — path casing, remaining query
    params and their values — is preserved exactly, since on some sources
    (Comeet's `uid`, Greenhouse's `gh_jid`) that's the actual job identity.

    This must be the only place official URLs are cleaned up. Every
    importer normalizes through this function when building a
    NormalizedJob, and `BaseImporter.sync_jobs()` normalizes again as a
    backstop before matching or storing — so duplicate detection, update
    matching, and database storage all key off the exact same canonical
    string regardless of which importer produced it.

    Real-world case this fixes: Moon Active and SuperPlay's Comeet-hosted
    URLs return a fresh cache-busting `t=` (sometimes `src=`/`fbclid=`)
    value on every fetch. Before this normalizer existed, that produced 15
    duplicate rows for the same live posting (cleaned up separately as a
    one-off data fix) because sync_jobs()'s exact-string match treated each
    re-scrape as a brand new URL.
    """
    if not url:
        return url

    parts = urlsplit(url.strip())

    kept_params = sorted(
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key.lower() not in TRACKING_QUERY_PARAMS
    )

    path = parts.path.rstrip("/") if len(parts.path) > 1 else parts.path

    return urlunsplit(
        (
            parts.scheme.lower(),
            parts.netloc.lower(),
            path,
            urlencode(kept_params),
            "",  # fragment — never part of server-side job identity
        )
    )
