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
GREENHOUSE_COMPANIES: dict[str, str] = {
    "HoYoverse": "hoyoverse",
    "Krafton": "kraftonamericas",
}
