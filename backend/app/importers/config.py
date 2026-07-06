# Maps a Company.name (must already exist in the companies table) to the
# company's official public Greenhouse board token — the slug that appears
# in the company's own careers page / in
# https://boards-api.greenhouse.io/v1/boards/<token>/jobs
#
# Only add an entry here once you have confirmed, from the company's own
# careers page, that they publish jobs through a public Greenhouse board.
# Do not guess a token — an unconfirmed or wrong entry will either 404
# safely (skipped, see run_importers.py) or, worse, silently import another
# company's jobs under the wrong name.
#
# Example, once confirmed:
# GREENHOUSE_COMPANIES = {
#     "Some Company": "somecompany",
# }
#
# Confirmed via a direct call to https://boards-api.greenhouse.io/v1/boards/<token>/jobs
# on 2026-07-05:
#   - "hoyoverse" -> real, currently 0 open jobs.
#   - "kraftonamericas" -> real, jobs returned have company_name "KRAFTON Americas"
#     (Krafton's US office/subsidiary — same company family as our "Krafton" row).
#
# Confirmed via the same direct API call on 2026-07-06:
#   - "zyngacareers" -> real, company_name "Zynga", 45 open jobs.
#   - "playtikaltd" -> real, company_name "Playtika Ltd", 28 open jobs.
#   - "epicgames" -> real, company_name "Epic Games", 127 open jobs.
#
# Deliberately NOT added here yet: Bungie ("bungie" token, confirmed real,
# 1 open job) and Naughty Dog / Insomniac Games. All three are first-party
# PlayStation Studios whose jobs may already be imported under "Sony
# Interactive Entertainment" via the PlayStation importer (confirmed for
# Bungie: its one open Greenhouse job, "Marathon UI/UX Director", is the
# exact same posting already stored under Sony Interactive Entertainment
# with department "Bungie, Inc." — same requisition, different official_url
# format, so today's exact-URL dedupe in sync_jobs() would not catch it and
# it would show up twice under two different companies). Add these only
# after a parent-company/dedupe decision is made for the PlayStation-family
# studios.
GREENHOUSE_COMPANIES: dict[str, str] = {
    "HoYoverse": "hoyoverse",
    "Krafton": "kraftonamericas",
    "Zynga": "zyngacareers",
    "Playtika": "playtikaltd",
    "Epic Games": "epicgames",
}

# Maps a Company.name (must already exist in the companies table) to the
# company's public Comeet company UID + token — both appear embedded
# directly in the company's own careers page HTML (they are not secrets;
# Comeet's own client-side widget uses them the same way).
#
# Confirmed via a direct call to
# https://www.comeet.co/careers-api/2.0/company/<company_uid>/positions?token=<token>
# on 2026-07-05:
#   - Moon Active: token/uid embedded in the HTML of
#     moonactive.com/hot-positions/, real, currently open positions returned.
COMEET_COMPANIES: dict[str, dict[str, str]] = {
    "Moon Active": {
        "company_uid": "A2.00C",
        "token": "2ACD5C02AC10081008AB01560180C804",
    },
}
