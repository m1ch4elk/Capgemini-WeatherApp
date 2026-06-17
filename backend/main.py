from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database.db import init_db, get_db
from services.weather_service import get_weather_data

app = FastAPI(
    title="Weather App API",
    description="API für Wetterdaten mit Caching",
    version="1.0.0"
)

# CORS konfigurieren (für Frontend-Zugriff)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In Produktion: spezifische Domains angeben
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialisiere die Datenbank beim Start."""
    init_db()


@app.get("/")
async def root():
    """Health-Check Endpoint."""
    return {
        "message": "Weather App Backend",
        "status": "running",
        "endpoints": {
            "weather": "/weather/{city}",
            "docs": "/docs"
        }
    }


@app.get("/weather/{city}")
async def get_weather(city: str, db: Session = Depends(get_db)):
    """
    Ruft Wetterdaten für eine Stadt ab.
    
    - Nutzt Cache wenn Daten jünger als 1 Stunde sind
    - Sonst werden neue Daten von der wttr.in API abgerufen
    
    **Parameter:**
    - `city`: Stadtname (z.B. "cologne", "berlin", "london")
    
    **Returns:**
    - `city`: Eingegeben Stadtname
    - `data`: Komplette Wetterdaten-JSON von wttr.in
    - `from_cache`: Boolean - ob Daten aus Cache kommen
    - `cached_at`: ISO-Timestamp wann Daten zuletzt aktualisiert wurden
    """
    try:
        result, _ = await get_weather_data(city, db)
        return result
    except ValueError as e:
        # Stadt nicht gefunden
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Andere Fehler
        raise HTTPException(status_code=500, detail=str(e))