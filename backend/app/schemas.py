from pydantic import BaseModel


class CompanyBase(BaseModel):
    name: str
    country: str | None = None
    city: str | None = None
    platform: str | None = None
    engine: str | None = None
    careers_url: str | None = None
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