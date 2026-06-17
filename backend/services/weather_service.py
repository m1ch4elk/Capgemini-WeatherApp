import httpx
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.weather import WeatherData
from typing import Dict, Any, Tuple

WTTR_API_URL = "https://wttr.in/{city}?format=j2"
CACHE_TTL_HOURS = 1


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
            api_data = response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise ValueError(f"City '{city}' not found in weather API")
        raise Exception(f"Weather API error: {e.response.status_code} - {e.response.text}")
    except httpx.RequestError as e:
        raise Exception(f"Network error while fetching weather: {str(e)}")
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
