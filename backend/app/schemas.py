from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel


class CompanyBase(BaseModel):
    name: str
    industry: str | None = None
    country: str | None = None
    city: str | None = None
    platform: str | None = None
    engine: str | None = None
    website: str | None = None
    careers_url: str | None = None
    region: str | None = None
    language_focus: str | None = None
    priority: str = "normal"
    remote: bool = False
    hybrid: bool = False
    onsite: bool = False
    relocation: bool = False
    visa: bool = False


class CompanyCreate(CompanyBase):
    pass


class CompanyRead(CompanyBase):
    id: int

    class Config:
        from_attributes = True


class JobBase(BaseModel):
    company_id: int
    title: str
    department: str | None = None
    country: str | None = None
    city: str | None = None
    work_model: str | None = None
    experience_level: str | None = None
    platform: str | None = None
    official_url: str | None = None
    status: str = "open"
    posted_date: date | None = None
    first_seen: datetime | None = None
    last_checked: datetime | None = None
    notes: str | None = None
    source_type: Literal["official", "manual", "demo"] = "manual"
    is_verified: bool = False


class JobCreate(JobBase):
    pass


class JobRead(JobBase):
    id: int
    company: CompanyRead | None = None

    class Config:
        from_attributes = True


class CompanyWithJobs(CompanyRead):
    jobs: list[JobRead] = []


class ImporterRunResult(BaseModel):
    companies_checked: int
    companies_skipped: int
    jobs_found: int
    jobs_added: int
    jobs_updated: int
    jobs_closed: int
    errors: list[str]
    refreshed_at: datetime | None = None


class ImporterStateRead(BaseModel):
    last_refresh_at: datetime | None = None