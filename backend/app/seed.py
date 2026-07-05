from app.database import SessionLocal, Base, engine
from app.models import Company

Base.metadata.create_all(bind=engine)

db = SessionLocal()

companies = [
    Company(
        name="Rockstar Games",
        country="USA",
        city="New York",
        platform="PC/Console",
        engine="RAGE",
        careers_url="https://www.rockstargames.com/careers",
        remote=False,
        hybrid=True,
        onsite=True,
        relocation=True,
        visa=False,
    ),
    Company(
        name="ArenaNet",
        country="USA",
        city="Bellevue",
        platform="PC",
        engine="Proprietary",
        careers_url="https://www.arena.net/en/careers",
        remote=False,
        hybrid=True,
        onsite=True,
        relocation=False,
        visa=False,
    ),
    Company(
        name="Moon Active",
        country="Israel",
        city="Tel Aviv",
        platform="Mobile",
        engine="Unity",
        careers_url="https://careers.moonactive.com",
        remote=False,
        hybrid=True,
        onsite=True,
        relocation=False,
        visa=False,
    ),
]

for company in companies:
    exists = db.query(Company).filter(Company.name == company.name).first()
    if not exists:
        db.add(company)

db.commit()
db.close()

print("Seed completed")