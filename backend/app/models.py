from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, unique=True)

    industry = Column(String)

    country = Column(String)

    city = Column(String)

    platform = Column(String)

    engine = Column(String)

    website = Column(String)

    careers_url = Column(String)

    # region: broad hiring region, e.g. "North America", "Europe", "Asia".
    region = Column(String)

    # language_focus: language(s) an applicant needs to actually apply,
    # e.g. "English" or "Hebrew/English" — not the company's home language.
    language_focus = Column(String)

    # priority: "normal" (shown by default) or "low" (local-language-only
    # careers page, kept in the database but deprioritized/hidden by
    # default rather than removed).
    priority = Column(String, default="normal")

    remote = Column(Boolean)

    hybrid = Column(Boolean)

    onsite = Column(Boolean)

    relocation = Column(Boolean)

    visa = Column(Boolean)

    jobs = relationship("Job", back_populates="company")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    title = Column(String, nullable=False)

    department = Column(String)

    country = Column(String)

    city = Column(String)

    work_model = Column(String)

    experience_level = Column(String)

    platform = Column(String)

    official_url = Column(String)

    status = Column(String, default="open")

    posted_date = Column(Date)

    first_seen = Column(DateTime)

    last_checked = Column(DateTime)

    notes = Column(Text)

    source_type = Column(String, default="manual", nullable=False)

    is_verified = Column(Boolean, default=False, nullable=False)

    company = relationship("Company", back_populates="jobs")


class ImporterState(Base):
    """Single-row table tracking when the importer system last completed a run.

    Used to compute "new since last check": a job is new if its first_seen
    matches this timestamp (i.e. it was added during the most recent run).
    """

    __tablename__ = "importer_state"

    id = Column(Integer, primary_key=True)

    last_refresh_at = Column(DateTime)