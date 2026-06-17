# Capgemini Weather App 🌤️

Eine vollständige Wetter-Anwendung mit FastAPI Backend und Vanilla JavaScript Frontend. Die Anwendung zeigt aktuelle Wetterdaten und eine 3-Tage-Vorhersage für beliebige Städte weltweit.

## Features ✨

### Backend
- **FastAPI Server** - RESTful API mit Wetterdaten
- **SQLite Datenbank** - Persistente Speicherung von Wetterdaten
- **1-Stunden Cache** - Optimierte API-Aufrufe mit automatischem Caching
- **CORS Support** - Kommunikation zwischen Frontend und Backend
- **Error Handling** - Robuste Fehlerbehandlung (404, 500, etc.)

### Frontend
- **Responsive Design** - Optimiert für Desktop und Mobile
- **Stadt-Suche** - Mit Eingabevalidierung
- **Aktuelle Wetterdaten** - Temperatur, Wind, Luftfeuchtigkeit, Sicht, Beschreibung
- **Temperaturbereich** - Min/Max Temperaturen für heute
- **Windrichtung & -geschwindigkeit** - Detaillierte Windinformationen
- **3-Tage-Vorhersage** - Mit Min/Max Temperaturen pro Tag
- **Wetter-Icons** - Visuelle Darstellung des Wetters
- **Cache-Status** - Anzeige ob Daten aus Cache oder Live abgerufen wurden
- **Loading-Animation** - Benutzerfreundliches Feedback während des Ladens
- **Fehlerbehandlung** - Aussagekräftige Fehlermeldungen

## Tech Stack 🛠️

- **Backend:** Python 3.x, FastAPI, SQLAlchemy, SQLite
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **API-Quelle:** wttr.in (kostenlose Wetter-API)
- **Server:** Python HTTP Server (Frontend), uvicorn (Backend)

## Projektstruktur 📁

```
Capgemini-WeatherApp/
├── backend/
│   ├── main.py                 # FastAPI Applikation
│   ├── requirements.txt        # Python Dependencies
│   ├── database/
│   │   ├── __init__.py
│   │   └── db.py              # Datenbankverbindung & Session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── weather.py         # SQLAlchemy Models
│   │   └── schemas.py         # Pydantic Schemas
│   └── services/
│       ├── __init__.py
│       └── weather_service.py # Wetter-Geschäftslogik
├── frontend/
│   ├── index.html             # HTML Struktur
│   ├── style.css              # Styling
│   ├── app.js                 # JavaScript Logik
│   └── assets/                # Bilder & Assets
└── README.md                  # Dieses File
```

## Installation & Setup 🚀

### Voraussetzungen
- **Python 3.7+** installiert
- **Git** installiert
- Terminal/PowerShell

### Backend Setup

1. **Repository klonen oder in das Verzeichnis navigieren:**
   ```bash
   cd backend
   ```

2. **Python Virtual Environment erstellen:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Dependencies installieren:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Backend-Server starten:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   Der Server ist jetzt erreichbar unter: **http://localhost:8000**
   
   - API Dokumentation: http://localhost:8000/docs (Swagger UI)
   - Alternative Docs: http://localhost:8000/redoc (ReDoc)

### Frontend Setup

1. **In das Frontend-Verzeichnis navigieren:**
   ```bash
   cd frontend
   ```

2. **HTTP Server starten (PowerShell/CMD):**
   
   **Option 1: Mit Python 3.x**
   ```bash
   python -m http.server 3000
   ```
   
   **Option 2: Mit Node.js (falls installiert)**
   ```bash
   npx http-server -p 3000
   ```
   
   **Option 3: Mit Live Server VS Code Extension**
   - Live Server Extension in VS Code installieren
   - Mit Rechtsklick auf `index.html` → "Open with Live Server"

3. **Frontend öffnen:**
   Die Anwendung ist jetzt erreichbar unter: **http://localhost:3000**

## Verwendung 📱

1. **Beide Server starten** (siehe Setup oben)
2. **Frontend in Browser öffnen:** http://localhost:3000
3. **Stadt eingeben** in das Suchfeld (z.B. "Berlin", "London", "Tokyo")
4. **Enter drücken oder Suchbutton klicken**
5. **Wetterdaten anschauen:**
   - 🌡️ Aktuelle Temperatur und Wetterlage
   - 💨 Windrichtung und -geschwindigkeit
   - 💧 Luftfeuchtigkeit und Sicht
   - 📅 3-Tage-Vorhersage mit Temperaturbereich
   - 📦 Cache-Status (Live Daten oder aus Cache)

## API Dokumentation 🔌

### Wetter-Endpoint

**Request:**
```bash
GET http://localhost:8000/weather/{city}
```

**Beispiel:**
```bash
curl http://localhost:8000/weather/Berlin
```

**Response (Erfolg):**
```json
{
  "city": "Berlin",
  "current_temp": 22,
  "description": "Partly cloudy",
  "wind_speed": 15,
  "wind_direction": "NW",
  "humidity": 65,
  "visibility": "10",
  "min_temp": 18,
  "max_temp": 25,
  "forecast": [
    {
      "day": 1,
      "min_temp": 18,
      "max_temp": 25,
      "description": "Sunny"
    },
    ...
  ],
  "cached": false,
  "timestamp": "2024-01-15T10:30:00"
}
```

**Response (Fehler - Stadt nicht gefunden):**
```json
{
  "detail": "City not found: InvalidCity"
}
```

### HTTP Status Codes
- **200 OK** - Erfolgreiche Anfrage
- **404 Not Found** - Stadt nicht gefunden
- **500 Internal Server Error** - Server-Fehler

## Troubleshooting 🔧

### Backend startet nicht
- **Fehler:** `ModuleNotFoundError: No module named 'fastapi'`
  - **Lösung:** Virtual Environment aktivieren und `pip install -r requirements.txt` ausführen

- **Fehler:** `Port 8000 already in use`
  - **Lösung:** Anderen Process beenden oder Port ändern:
    ```bash
    uvicorn main:app --port 8001
    ```

### Frontend lädt nicht
- **Fehler:** `Fehler beim Abrufen der Wetterdaten`
  - **Lösung:** Backend läuft nicht oder CORS ist nicht aktiviert
  - Prüfen ob Backend unter http://localhost:8000 erreichbar ist

- **Fehler:** CORS Error in Browser Console
  - **Lösung:** Backend ist nicht erreichbar
  - Backend starten: `uvicorn main:app --reload`

### Keine Daten werden angezeigt
- Browser Console öffnen (F12) und Errors prüfen
- Backend Logs überprüfen
- Netzwerkverbindung testen (curl command oben nutzen)
- Frontend-Port (3000) und Backend-Port (8000) überprüfen

## Entwicklung 💻

### Requirements installieren
```bash
cd backend
pip install -r requirements.txt
```

### Backend im Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Der `--reload` Flag startet den Server automatisch neu wenn Code geändert wird.

### Frontend Änderungen
- Einfach `index.html`, `style.css` oder `app.js` editieren
- Browser neu laden (F5 oder Ctrl+R)
- Bei Live Server: Automatisches Reload beim Speichern

## Lizenz 📄

Siehe [LICENSE](./LICENSE) Datei

## Autor & Kontakt 👤

Capgemini Intern Projekt

---

**Viel Spaß mit der Wetter-App!** 🌤️☀️🌧️
