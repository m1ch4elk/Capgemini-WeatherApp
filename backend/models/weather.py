from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class WeatherData(Base):
    __tablename__ = "weather_data"

    city = Column(String(100), primary_key=True, index=True)
    data = Column(JSON, nullable=False)  # Komplette JSON-Response von wttr.in
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<WeatherData(city={self.city}, updated_at={self.updated_at})>"
