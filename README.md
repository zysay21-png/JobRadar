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

### Quick Start (recommended)

From the repo root, run:

```bash
./start.sh
```

This starts both the FastAPI backend and the Vite frontend with one command, and prints the URL for each once they're ready (backend at `http://127.0.0.1:8000`, frontend URL is printed by Vite — normally `http://localhost:5173`). On first run it will automatically create the backend virtual environment and install both backend and frontend dependencies if they're missing. Press `Ctrl+C` to stop both servers.

Tested on Ubuntu. Requires `bash`, `python3`, and `npm` to already be installed on the machine.

### Prerequisites

- Python 3.10+
- Node.js + npm (for the frontend)

### Manual Setup

If you'd rather run each piece yourself instead of using `start.sh`:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

```bash
cd frontend
npm install
```

### Run the API

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Interactive docs are available at `http://127.0.0.1:8000/docs`.

### Run the Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at the URL Vite prints (normally `http://localhost:5173`).

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
