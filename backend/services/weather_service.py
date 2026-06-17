import httpx
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.weather import WeatherData
from models.schemas import ParsedWeatherData, DayWeather
from typing import Dict, Any, Tuple
from pydantic import ValidationError

WTTR_API_URL = "https://wttr.in/{city}?format=j1"
CACHE_TTL_HOURS = 1


def parse_weather_response(city: str, api_response: Dict[str, Any]) -> ParsedWeatherData:
    """
    Parst die wttr.in API Response in ein strukturiertes Objekt.
    Extrahiert nur die relevanten Daten.
    
    Args:
        city: Stadtname
        api_response: JSON-Response von wttr.in
        
    Returns:
        ParsedWeatherData mit strukturierten Wetterdaten
        
    Raises:
        ValueError: Falls die Antwort nicht geparst werden kann
    """
    try:
        # Hole aktuelle Bedingungen
        current_condition = api_response["current_condition"][0]
        nearest_area = api_response["nearest_area"][0]
        
        # Parse die Forecast-Tage
        forecast_days = []
        for day_data in api_response["weather"][:3]:  # Nimm die nächsten 3 Tage
            try:
                day_weather = DayWeather(
                    date=day_data["date"],
                    maxtemp_C=day_data["maxtempC"],
                    mintemp_C=day_data["mintempC"],
                    avgtemp_C=day_data["avgtempC"],
                    condition= str(day_data["hourly"][0]["weatherDesc"][0]["value"]).strip().lower() if day_data["hourly"] and day_data["hourly"][0]["weatherDesc"] else "Unknown",
                )
                forecast_days.append(day_weather)
            except (KeyError, IndexError):
                continue
        
        # Erstelle das ParsedWeatherData Objekt
        parsed_data = ParsedWeatherData(
            city=city,
            country=nearest_area["country"][0]["value"],
            temperature=float(current_condition["temp_C"]),
            feels_like=float(current_condition["FeelsLikeC"]),
            condition=str(current_condition["weatherDesc"][0]["value"]).strip().lower(),
            humidity=int(current_condition["humidity"]),
            wind_speed=float(current_condition["windspeedKmph"]),
            wind_direction=current_condition["winddir16Point"],
            precipitation=float(current_condition["precipMM"]),
            pressure=int(current_condition["pressure"]),
            uv_index=int(current_condition["uvIndex"]),
            visibility=int(current_condition["visibility"]),
            forecast_days=forecast_days,
            last_updated=datetime.now().isoformat()
        )
        
        return parsed_data
        
    except (KeyError, IndexError, ValidationError) as e:
        raise ValueError(f"Failed to parse weather data: {str(e)}")


async def get_weather_data(city: str, db: Session) -> Tuple[Dict[str, Any], bool]:
    """
    Ruft Wetterdaten ab - entweder aus dem Cache oder von der API.
    
    Args:
        city: Stadtname (z.B. "cologne", "berlin")
        db: Datenbank-Session
        
    Returns:
        Tuple von (weather_data_dict, from_cache_bool)
        
    Raises:
        Exception: Bei API-Fehler oder ungültigem Stadtnamen
    """
    
    # Versuche, Daten aus der DB zu laden
    db_entry = db.query(WeatherData).filter(WeatherData.city == city.lower()).first()
    
    # Prüfe ob Daten noch aktuell sind (nicht älter als CACHE_TTL_HOURS)
    if db_entry:
        time_diff = datetime.utcnow() - db_entry.updated_at
        if time_diff < timedelta(hours=CACHE_TTL_HOURS):
            print(f"Cache hit for {city}: {time_diff.total_seconds():.1f} seconds old")
            return {
                "city": city,
                "data": db_entry.data,
                "from_cache": True,
                "cached_at": db_entry.updated_at.isoformat()
            }, True
    
    # Cache miss oder abgelaufen - neue Daten von API abrufen
    print(f"Cache miss/expired for {city}, fetching from API...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                WTTR_API_URL.format(city=city),
                timeout=10.0
            )
            response.raise_for_status()
            api_response = response.json()
            
        # Parse die API Response in ein strukturiertes Objekt
        parsed_weather = parse_weather_response(city, api_response)
        api_data = parsed_weather.model_dump()  # Konvertiere zu Dict für DB-Speicherung
        
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise ValueError(f"City '{city}' not found in weather API")
        raise Exception(f"Weather API error: {e.response.status_code} - {e.response.text}")
    except httpx.RequestError as e:
        raise Exception(f"Network error while fetching weather: {str(e)}")
    except ValueError as e:
        raise Exception(f"Failed to parse weather data: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error: {str(e)}")
    
    # Speichere/Update Daten in der Datenbank
    db_entry = db.query(WeatherData).filter(WeatherData.city == city.lower()).first()
    
    if db_entry:
        # Update existierenden Eintrag
        db_entry.data = api_data
        db_entry.updated_at = datetime.utcnow()
    else:
        # Erstelle neuen Eintrag
        db_entry = WeatherData(
            city=city.lower(),
            data=api_data,
            updated_at=datetime.utcnow()
        )
        db.add(db_entry)
    
    db.commit()
    db.refresh(db_entry)
    
    return {
        "city": city,
        "data": api_data,
        "from_cache": False,
        "cached_at": db_entry.updated_at.isoformat()
    }, False
