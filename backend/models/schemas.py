from pydantic import BaseModel, Field
from typing import List


class WeatherCondition(BaseModel):
    """Einzelne Wetterbedingung"""
    time: str
    temperature: float = Field(alias="temp_C")
    feels_like: float = Field(alias="FeelsLikeC")
    humidity: int
    wind_speed: float = Field(alias="windspeedKmph")
    wind_direction: str = Field(alias="winddir16Point")
    condition: str = Field(alias="weatherDesc")
    precipitation: float = Field(alias="precipMM")
    pressure: int = Field(alias="pressure")
    uv_index: int = Field(alias="uvIndex")

    class Config:
        populate_by_name = True


class DayWeather(BaseModel):
    """Wetterdaten für einen Tag"""
    date: str = Field(alias="date")
    max_temp: float = Field(alias="maxtemp_C")
    min_temp: float = Field(alias="mintemp_C")
    avg_temp: float = Field(alias="avgtemp_C")
    condition: str = Field(alias="condition")

    class Config:
        populate_by_name = True


class ParsedWeatherData(BaseModel):
    """Strukturierte Wetterdaten aus wttr.in API"""
    city: str
    country: str
    temperature: float
    feels_like: float
    condition: str
    humidity: int
    wind_speed: float
    wind_direction: str
    precipitation: float
    pressure: int
    uv_index: int
    visibility: int
    forecast_days: List[DayWeather] = Field(default=[])
    last_updated: str
