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

    last_checked = Column(DateTime)

    notes = Column(Text)

    source_type = Column(String, default="manual", nullable=False)

    is_verified = Column(Boolean, default=False, nullable=False)

    company = relationship("Company", back_populates="jobs")