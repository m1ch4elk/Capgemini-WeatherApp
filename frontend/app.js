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
    const currentCondition = weatherData.current_condition[0];
    const nearestArea = weatherData.nearest_area[0];
    const weatherDays = weatherData.weather;

    // Update current weather
    document.getElementById('cityName').textContent = nearestArea.areaName[0].value;
    document.getElementById('country').textContent = nearestArea.country[0].value;
    document.getElementById('weatherDesc').textContent = currentCondition.weatherDesc[0].value;
    document.getElementById('weatherIcon').src = currentCondition.weatherIconUrl[0].value;
    document.getElementById('feelsLike').textContent = `Gefühlte Temperatur: ${currentCondition.FeelsLikeC}°C`;
    document.getElementById('currentTemp').textContent = `${currentCondition.temp_C}°C`;
    document.getElementById('maxTemp').textContent = `${weatherDays[0].maxtempC}°C`;
    document.getElementById('minTemp').textContent = `${weatherDays[0].mintempC}°C`;
    document.getElementById('windDirection').textContent = currentCondition.winddir16Point;
    document.getElementById('windSpeed').textContent = `${currentCondition.windspeedKmph} km/h`;
    document.getElementById('humidity').textContent = `${currentCondition.humidity}%`;
    document.getElementById('visibility').textContent = `${currentCondition.visibility} km`;

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

    // Update forecast for 3 days
    for (let i = 0; i < 3 && i < weatherDays.length; i++) {
        const day = weatherDays[i];
        document.getElementById(`forecastDate${i}`).textContent = formatDate(day.date);
        
        // Try to get icon from hourly data
        if (day.hourly && day.hourly.length > 0) {
            document.getElementById(`forecastIcon${i}`).src = day.hourly[0].weatherIconUrl[0].value;
        } else {
            document.getElementById(`forecastIcon${i}`).src = '';
        }
        
        document.getElementById(`forecastMaxTemp${i}`).textContent = `${day.maxtempC}°C`;
        document.getElementById(`forecastMinTemp${i}`).textContent = `${day.mintempC}°C`;
    }

    // Show sections
    currentWeatherSection.style.display = 'block';
    forecastSection.style.display = 'block';
    emptyState.style.display = 'none';
}

// ==================== UTILITY FUNCTIONS ====================

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
