from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.models import Company
from app.schemas import CompanyCreate, CompanyRead

app = FastAPI(title="Job Radar API")

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