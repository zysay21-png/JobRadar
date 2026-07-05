from sqlalchemy import Column, Integer, String, Boolean

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, unique=True)

    country = Column(String)

    city = Column(String)

    platform = Column(String)

    engine = Column(String)

    careers_url = Column(String)

    remote = Column(Boolean)

    hybrid = Column(Boolean)

    onsite = Column(Boolean)

    relocation = Column(Boolean)

    visa = Column(Boolean)