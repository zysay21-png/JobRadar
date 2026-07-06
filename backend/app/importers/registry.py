from app.importers.arenanet import ArenaNetImporter
from app.importers.base import BaseImporter
from app.importers.config import GREENHOUSE_COMPANIES
from app.importers.greenhouse import GreenhouseImporter
from app.importers.gunfire_games import GunfireGamesImporter
from app.importers.moon_active import MoonActiveImporter


def get_importers() -> list[BaseImporter]:
    """All importers the runner should execute.

    How to add a new company:
      - If it publishes jobs through a public Greenhouse board: add one line
        to GREENHOUSE_COMPANIES in app/importers/config.py. No new file, no
        change here.
      - Otherwise: create app/importers/<company>.py with a class
        implementing BaseImporter (app/importers/moon_active.py is a
        working template), then add one line below to import and
        instantiate it.
    """
    importers: list[BaseImporter] = [
        MoonActiveImporter(),
        GunfireGamesImporter(),
        ArenaNetImporter(),
    ]

    importers.extend(
        GreenhouseImporter(company_name, board_token)
        for company_name, board_token in GREENHOUSE_COMPANIES.items()
    )

    return importers
