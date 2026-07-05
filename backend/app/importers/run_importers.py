"""Backward-compatible CLI entry point: `python -m app.importers.run_importers`.

The importer framework itself now lives in app/importers/base.py (interface),
app/importers/registry.py (which importers exist), and app/importers/runner.py
(execution loop). This module just wires the CLI to that framework.
"""

from app.database import SessionLocal
from app.importers.runner import run_all


def run():
    db = SessionLocal()
    try:
        run_all(db)
    finally:
        db.close()


if __name__ == "__main__":
    run()
