// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINT = `${API_BASE_URL}/weather`;

// ==================== DOM ELEMENTS ====================
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const currentWeatherSection = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const emptyState = document.getElementById('emptyState');

// ==================== EVENT LISTENERS ====================
searchForm.addEventListener('submit', handleSearch);

// ==================== MAIN FUNCTIONS ====================

/**
 * Handle search form submission
 */
async function handleSearch(e) {
    e.preventDefault();
    const city = cityInput.value.trim();

    if (!city) {
        showError('Bitte geben Sie einen Stadtnamen ein.');
        return;
    }

    clearError();
    await fetchWeather(city);
}

/**
 * Fetch weather data from API
 */
async function fetchWeather(city) {
    try {
        showLoading(true);
        hideAllSections();

        const response = await fetch(`${API_ENDPOINT}/${encodeURIComponent(city)}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Stadt "${city}" nicht gefunden.`);
            } else {
                throw new Error('Fehler beim Abrufen der Wetterdaten.');
            }
        }

        const data = await response.json();
        updateUI(data);
        showLoading(false);

    } catch (error) {
        showLoading(false);
        showError(error.message);
        hideAllSections();
    }
}

/**
 * Update UI with weather data
 */
function updateUI(data) {
    const weatherData = data.data;
    const forecastDays = weatherData.forecast_days;

    // Update current weather
    document.getElementById('cityName').textContent = weatherData.city;
    document.getElementById('country').textContent = weatherData.country;
    document.getElementById('weatherDesc').textContent = weatherData.condition;
    document.getElementById('weatherIcon').src = selectIcon(weatherData.condition);
    document.getElementById('feelsLike').textContent = `Gefühlte Temperatur: ${weatherData.feels_like}°C`;
    document.getElementById('currentTemp').textContent = `${weatherData.temperature}°C`;
    document.getElementById('maxTemp').textContent = `${forecastDays[0].max_temp}°C`;
    document.getElementById('minTemp').textContent = `${forecastDays[0].min_temp}°C`;
    document.getElementById('windDirection').textContent = weatherData.wind_direction;
    document.getElementById('windSpeed').textContent = `${weatherData.wind_speed} km/h`;
    document.getElementById('humidity').textContent = `${weatherData.humidity}%`;
    document.getElementById('visibility').textContent = `${weatherData.visibility} km`;

    // Update cache status
    const cacheStatus = document.getElementById('cacheStatus');
    if (data.from_cache) {
        cacheStatus.textContent = '📦 Aus Cache';
        cacheStatus.className = 'cache-badge cached';
    } else {
        cacheStatus.textContent = '🔄 Live Daten';
        cacheStatus.className = 'cache-badge fresh';
    }
    document.getElementById('updateTime').textContent = `Aktualisiert: ${formatTime(new Date(data.cached_at))}`;

    // Update forecast for 2 days
    for (let i = 1; i < 3 && i < forecastDays.length; i++) {
        const day = forecastDays[i];
        document.getElementById(`forecastDate${i}`).textContent = formatDate(day.date);
        document.getElementById(`forecastIcon${i}`).src = selectIcon(day.condition);        
        document.getElementById(`forecastMaxTemp${i}`).textContent = `${day.max_temp}°C`;
        document.getElementById(`forecastMinTemp${i}`).textContent = `${day.min_temp}°C`;
    }

    // Show sections
    currentWeatherSection.style.display = 'block';
    forecastSection.style.display = 'block';
    emptyState.style.display = 'none';
}

// ==================== UTILITY FUNCTIONS ====================

function selectIcon(weatherCondition) {
    console.log(weatherCondition);
    switch(weatherCondition) {
        case "sunny":
        case "clear":
            return "assets/sun.svg";
        case "cloudy":
            return "assets/cloud.svg";
        case "rainy":
            return "assets/rain.svg";
        case "partly cloudy":
            return "assets/partlyCloudy.svg";
        default:
            return "assets/weatherCondition_fallback.svg";
    }
}

/**
 * Format date string to readable format
 */
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
}

/**
 * Format time to readable format
 */
function formatTime(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('de-DE', options);
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

/**
 * Clear error message
 */
function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

/**
 * Show/hide loading spinner
 */
function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

/**
 * Hide all weather sections
 */
function hideAllSections() {
    currentWeatherSection.style.display = 'none';
    forecastSection.style.display = 'none';
    emptyState.style.display = 'none';
}

// ==================== INITIALIZATION ====================
emptyState.style.display = 'flex';
