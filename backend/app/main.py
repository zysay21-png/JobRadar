from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.importers.run_importers import run_all
from app.models import Company, Job
from app.schemas import (
    CompanyCreate,
    CompanyRead,
    CompanyWithJobs,
    ImporterRunResult,
    JobCreate,
    JobRead,
)

app = FastAPI(title="Job Radar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Job Radar API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/companies", response_model=CompanyRead)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    new_company = Company(**company.model_dump())
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company


@app.get("/companies", response_model=list[CompanyRead])
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()


@app.get("/companies/{company_id}", response_model=CompanyWithJobs)
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@app.post("/jobs", response_model=JobRead)
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == job.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    new_job = Job(**job.model_dump())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


@app.get("/jobs", response_model=list[JobRead])
def get_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()


@app.get("/jobs/{job_id}", response_model=JobRead)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/importers/run", response_model=ImporterRunResult)
def run_importers(db: Session = Depends(get_db)):
    return run_all(db)