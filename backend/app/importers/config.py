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
GREENHOUSE_COMPANIES: dict[str, str] = {}
