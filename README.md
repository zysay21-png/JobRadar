# Job Radar

Job Radar is a backend service for tracking game/tech companies and their job openings. It currently exposes a REST API for managing a directory of companies (location, platform, engine, careers page, and work-arrangement flags such as remote/hybrid/onsite/relocation/visa support).

## Tech Stack

- **FastAPI** — web framework
- **SQLAlchemy** — ORM
- **SQLite** — local database
- **Pydantic** — request/response schemas
- **Uvicorn** — ASGI server

## Project Structure

```
JobRadar/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app and route definitions
│   │   ├── models.py      # SQLAlchemy ORM models
│   │   ├── schemas.py     # Pydantic request/response schemas
│   │   ├── database.py    # Database engine and session setup
│   │   └── seed.py        # Script to seed sample company data
│   └── requirements.txt
├── database/               # Reserved for future migration/database assets
├── docs/                    # Reserved for project documentation
└── frontend/                # Reserved for future frontend application
```

## Getting Started

### Prerequisites

- Python 3.10+

### Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Run the API

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Interactive docs are available at `http://127.0.0.1:8000/docs`.

### Seed Sample Data

```bash
cd backend
python -m app.seed
```

This populates the local SQLite database with a few sample companies.

## API Endpoints

| Method | Endpoint      | Description                |
|--------|---------------|----------------------------|
| GET    | `/`           | API status message         |
| GET    | `/health`     | Health check                |
| GET    | `/companies`  | List all companies         |
| POST   | `/companies`  | Create a new company        |

## Status

This project is in early development. The `Company` model and API are implemented as foundational reference data; job listing tracking and matching features are planned next.
