from app.importers.base import BaseImporter
from app.importers.config import (
    COMEET_COMPANIES,
    GREENHOUSE_COMPANIES,
    GREENHOUSE_PREFER_OFFICES_CITY,
)
from app.importers.custom.playstation import PlayStationImporter
from app.importers.custom.riot_games import RiotGamesImporter
from app.importers.custom.rockstar_games import RockstarGamesImporter
from app.importers.platforms.arenanet import ArenaNetImporter
from app.importers.platforms.comeet import ComeetImporter
from app.importers.platforms.electronic_arts import ElectronicArtsImporter
from app.importers.platforms.greenhouse import GreenhouseImporter
from app.importers.platforms.gunfire_games import GunfireGamesImporter


def get_importers() -> list[BaseImporter]:
    """All importers the runner should execute.

    Importers live in one of two places (see importers/README.md for the
    full explanation):
      - app/importers/platforms/ — importers backed by a real, reusable
        third-party ATS (Greenhouse, Comeet, Ashby, Paylocity, SAP
        SuccessFactors, ...). Greenhouse and Comeet are already
        config-driven: adding a company there is a one-line config entry,
        no new file, no change here. The others (arenanet.py — Ashby,
        gunfire_games.py — Paylocity, electronic_arts.py — SAP
        SuccessFactors) are still single-company classes today because
        only one company each has been confirmed on that platform so far —
        they'll move to the config-driven pattern once a second company on
        the same platform is added.
      - app/importers/custom/ — importers backed by a company's own
        proprietary, in-house careers system (not a third-party ATS at
        all), so there is nothing to generalize. One file per company,
        permanently.

    How to add a new company:
      - Publishes jobs through a public Greenhouse board: add one line to
        GREENHOUSE_COMPANIES in app/importers/config.py. No new file.
      - Publishes jobs through a public Comeet Careers API: add one entry
        to COMEET_COMPANIES in app/importers/config.py. No new file.
      - Publishes jobs through Ashby, Paylocity, or SAP SuccessFactors: a
        second confirmed company on that platform is the trigger to
        generalize it into a config-driven module under platforms/ (see
        arenanet.py / gunfire_games.py / electronic_arts.py as the
        single-company starting point) — do that refactor first, then add
        the company as a config entry, the same way Comeet was done.
      - Uses its own proprietary careers system: create
        app/importers/custom/<company>.py with a class implementing
        BaseImporter (app/importers/custom/rockstar_games.py is a working
        template), then add one line below to import and instantiate it.
    """
    importers: list[BaseImporter] = [
        GunfireGamesImporter(),
        ArenaNetImporter(),
        RockstarGamesImporter(),
        PlayStationImporter(),
        ElectronicArtsImporter(),
        RiotGamesImporter(),
    ]

    importers.extend(
        GreenhouseImporter(
            company_name,
            board_token,
            prefer_offices_for_city=company_name in GREENHOUSE_PREFER_OFFICES_CITY,
        )
        for company_name, board_token in GREENHOUSE_COMPANIES.items()
    )

    importers.extend(
        ComeetImporter(company_name, config["company_uid"], config["token"])
        for company_name, config in COMEET_COMPANIES.items()
    )

    return importers
