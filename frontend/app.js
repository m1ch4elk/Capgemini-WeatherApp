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

    // Validation
    if (!city) {
        showError('Bitte geben Sie einen Stadtnamen ein.');
        return;
    }

    // Clear previous errors
    clearError();

    // Fetch weather data
    await fetchWeather(city);
}

/**
 * Fetch weather data from API
 */
async function fetchWeather(city) {
    try {
        // Show loading state
        showLoading(true);
        hideAllSections();

        // Make API request
        const response = await fetch(`${API_ENDPOINT}/${encodeURIComponent(city)}`);

        // Handle different response statuses
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Stadt "${city}" nicht gefunden. Bitte überprüfen Sie den Namen.`);
            } else if (response.status === 500) {
                throw new Error('Fehler beim Abrufen der Wetterdaten. Bitte versuchen Sie später erneut.');
            } else {
                throw new Error(`API-Fehler: ${response.status}`);
            }
        }

        const data = await response.json();

        // Process and display data
        processWeatherData(data);
        showLoading(false);

    } catch (error) {
        showLoading(false);
        showError(error.message);
        hideAllSections();
    }
}

/**
 * Process weather data and update UI
 */
function processWeatherData(data) {
    const weatherData = data.data;
    const currentCondition = weatherData.current_condition[0];
    const nearestArea = weatherData.nearest_area[0];
    const weatherDays = weatherData.weather;

    // Update current weather
    updateCurrentWeather(currentCondition, nearestArea, data.cached_at, data.from_cache);

    // Update forecast
    updateForecast(weatherDays);

    // Show sections
    currentWeatherSection.style.display = 'block';
    forecastSection.style.display = 'block';
    emptyState.style.display = 'none';
}

/**
 * Update current weather section
 */
function updateCurrentWeather(currentCondition, nearestArea, cachedAt, fromCache) {
    // Location info
    document.getElementById('cityName').textContent = nearestArea.areaName[0].value;
    document.getElementById('country').textContent = nearestArea.country[0].value;

    // Weather icon and description
    const weatherDesc = currentCondition.weatherDesc[0].value;
    document.getElementById('weatherDesc').textContent = weatherDesc;
    document.getElementById('weatherIcon').src = currentCondition.weatherIconUrl[0].value;
    document.getElementById('weatherIcon').alt = weatherDesc;

    // Feels like temperature
    const feelsLike = `Gefühlte Temperatur: ${currentCondition.FeelsLikeC}°C`;
    document.getElementById('feelsLike').textContent = feelsLike;

    // Current temperature (from current_condition)
    document.getElementById('currentTemp').textContent = `${currentCondition.temp_C}°C`;

    // Get today's data for min/max temps (from weather[0])
    const todayWeather = getTodayWeatherData();
    if (todayWeather) {
        document.getElementById('maxTemp').textContent = `${todayWeather.maxtempC}°C`;
        document.getElementById('minTemp').textContent = `${todayWeather.mintempC}°C`;
    }

    // Wind
    document.getElementById('windDirection').textContent = currentCondition.winddir16Point;
    document.getElementById('windSpeed').textContent = `${currentCondition.windspeedKmph} km/h`;

    // Additional info
    document.getElementById('humidity').textContent = `${currentCondition.humidity}%`;
    document.getElementById('visibility').textContent = `${currentCondition.visibility} km`;

    // Cache status
    const cacheStatus = document.getElementById('cacheStatus');
    if (fromCache) {
        cacheStatus.textContent = '📦 Aus Cache';
        cacheStatus.className = 'cache-badge cached';
    } else {
        cacheStatus.textContent = '🔄 Live Daten';
        cacheStatus.className = 'cache-badge fresh';
    }

    // Update time
    const updateTime = new Date(cachedAt);
    const formattedTime = formatTime(updateTime);
    document.getElementById('updateTime').textContent = `Aktualisiert: ${formattedTime}`;
}

/**
 * Get today's weather data from the weather array
 */
function getTodayWeatherData() {
    // We need to get data from the API response's weather array
    // This is called from the fetch response, so we need to pass it
    // For now, we'll store it as a global during fetch
    return window.todayWeatherData || null;
}

/**
 * Update forecast section
 */
function updateForecast(weatherDays) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Show only 3 days of forecast
    const forecastDays = weatherDays.slice(0, 3);

    forecastDays.forEach(day => {
        const forecastCard = createForecastCard(day);
        forecastContainer.appendChild(forecastCard);
    });
}

/**
 * Create a forecast card element
 */
function createForecastCard(day) {
    const card = document.createElement('div');
    card.className = 'forecast-card';

    // Format date
    const dateStr = formatDate(day.date);

    // Get weather icon from hourly data if available
    let iconUrl = '';
    if (day.hourly && day.hourly.length > 0) {
        iconUrl = day.hourly[0].weatherIconUrl[0].value;
    }

    card.innerHTML = `
        <div class="forecast-date">${dateStr}</div>
        ${iconUrl ? `<img src="${iconUrl}" alt="Wetter" class="forecast-icon">` : ''}
        <div class="forecast-temps">
            <div class="forecast-temp">
                <span class="forecast-temp-label">Max</span>
                <span class="forecast-temp-value">${day.maxtempC}°C</span>
            </div>
            <div class="forecast-temp">
                <span class="forecast-temp-label">Min</span>
                <span class="forecast-temp-value">${day.mintempC}°C</span>
            </div>
        </div>
    `;

    return card;
}

/**
 * Modified processWeatherData to store today's data
 */
function processWeatherDataEnhanced(data) {
    const weatherData = data.data;
    const currentCondition = weatherData.current_condition[0];
    const nearestArea = weatherData.nearest_area[0];
    const weatherDays = weatherData.weather;

    // Store today's weather data for use in updateCurrentWeather
    window.todayWeatherData = weatherDays[0];

    // Update current weather
    updateCurrentWeather(currentCondition, nearestArea, data.cached_at, data.from_cache);

    // Update forecast
    updateForecast(weatherDays);

    // Show sections
    currentWeatherSection.style.display = 'block';
    forecastSection.style.display = 'block';
    emptyState.style.display = 'none';
}

// Override the original processWeatherData to use the enhanced version
function processWeatherData(data) {
    processWeatherDataEnhanced(data);
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
    errorMessage.scrollIntoView({ behavior: 'smooth' });
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
// Show empty state on load
emptyState.style.display = 'flex';
