const env = require('../config/env');
const weatherCacheSchema = require('../models/WeatherCache');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

function getWeatherCacheModel(tenantDb) {
  return tenantDb.model('WeatherCache', weatherCacheSchema);
}

/**
 * Fetch current weather from OpenWeather API
 */
async function getCurrentWeather(tenantDb, lat, lng) {
  if (!env.openweather.apiKey) {
    throw ApiError.badRequest('OpenWeather API key not configured');
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${env.openweather.apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }
    const data = await response.json();

    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed * 3.6, // m/s to km/h
      windDirection: data.wind.deg,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
      clouds: data.clouds.all,
      visibility: data.visibility,
      rain: data.rain ? data.rain['1h'] || 0 : 0,
      updatedAt: new Date(),
    };
  } catch (error) {
    logger.error('OpenWeather API error', { error: error.message });
    throw ApiError.internal('Failed to fetch weather data');
  }
}

/**
 * Fetch 7-day forecast from OpenWeather API (with caching)
 */
async function getForecast(tenantDb, lat, lng) {
  if (!env.openweather.apiKey) {
    throw ApiError.badRequest('OpenWeather API key not configured');
  }

  const today = new Date().toISOString().split('T')[0];

  // Check cache
  const WeatherCache = getWeatherCacheModel(tenantDb);
  const cached = await WeatherCache.findOne({ date: today }).lean();

  if (cached) {
    return cached.forecast;
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&cnt=40&appid=${env.openweather.apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }
    const data = await response.json();

    // Process into daily forecasts
    const dailyMap = {};
    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed * 3.6,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          main: item.weather[0].main,
          rain: item.rain ? item.rain['3h'] || 0 : 0,
        };
      } else {
        dailyMap[date].tempMin = Math.min(dailyMap[date].tempMin, item.main.temp_min);
        dailyMap[date].tempMax = Math.max(dailyMap[date].tempMax, item.main.temp_max);
        dailyMap[date].rain += item.rain ? item.rain['3h'] || 0 : 0;
      }
    }

    const forecast = Object.values(dailyMap);

    // Cache
    await WeatherCache.create({
      date: today,
      forecast,
      fetchedAt: new Date(),
    });

    return forecast;
  } catch (error) {
    logger.error('OpenWeather forecast API error', { error: error.message });
    throw ApiError.internal('Failed to fetch forecast data');
  }
}

module.exports = {
  getCurrentWeather,
  getForecast,
};
