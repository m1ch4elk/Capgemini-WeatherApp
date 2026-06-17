from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models.weather import Base, WeatherData
import os

# Datenbank-URL (SQLite-Datei im Backend-Verzeichnis)
DATABASE_URL = "sqlite:///./weather.db"

# Engine und Session-Fabrik erstellen
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Für SQLite notwendig
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialisiert die Datenbank - erstellt alle Tabellen."""
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")


def get_db() -> Session:
    """Liefert eine neue Datenbank-Session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
