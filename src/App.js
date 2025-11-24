import React, { useState, useEffect } from "react";
import DefaultScreen from "./components/DefaultScreen";
import Header from "./components/Header";
import SearchResult from "./components/SearchResult";
import "./style/index.css";
import { fetchWeatherApi } from "openmeteo";
import { weatherCodesMapping } from "./utils";
import {
  range,
  createWeatherObject,
  getTodayClosestTime,
} from "./RangeTimeUtils";

function App() {
  const [dailyForecast, setDailyForecast] = useState(null);
  const [hourlyForecastData, setHourlyForecastData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [forecastLocation, setForecastLocation] = useState({
    label: "London",
    lat: 51.5085,
    lng: -0.1257,
  });

  function processData(hourly, daily) {
    const hourlyObj = createWeatherObject(
      hourly.time,
      {
        temperature2m: hourly.temperature2m,
        visibility: hourly.visibility,
        windDirection10m: hourly.windDirection10m,
        apparentTemperature: hourly.apparentTemperature,
        precipitation_probability: hourly.precipitation_probability,
        humidity: hourly.humidity,
        windSpeed: hourly.windSpeed,
        weatherCode: hourly.weatherCode,
      },
      weatherCodesMapping
    );

    const dailyObj = createWeatherObject(
      daily.time,
      {
        weatherCode: daily.weatherCode,
        temperature2mMax: daily.temperature2mMax,
        temperature2mMin: daily.temperature2mMin,
        apparentTemperatureMax: daily.apparentTemperatureMax,
        apparentTemperatureMin: daily.apparentTemperatureMin,
        sunset: daily.sunset,
        sunrise: daily.sunrise,
        uvIndexMax: daily.uvIndexMax,
        precipitationSum: daily.precipitationSum,
        windSpeed10mMax: daily.windSpeed10mMax,
        windDirection10mDominant: daily.windDirection10mDominant,
      },
      weatherCodesMapping
    );

    const hourlyData = getTodayClosestTime(hourlyObj);
    return { dailyData: dailyObj, hourlyData };
  }

  const fetchWeather = async (lat = 51.5085, lon = -0.1275, switchScreen = false) => {
    setDataLoading(true);
    const params = {
      latitude: lat,
      longitude: lon,
      hourly: [
        "temperature_2m",
        "weather_code",
        "visibility",
        "wind_direction_10m",
        "apparent_temperature",
        "precipitation_probability",
        "relative_humidity_2m",
        "wind_speed_10m",
      ],
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "sunset",
        "uv_index_max",
        "precipitation_sum",
        "wind_speed_10m_max",
        "wind_direction_10m_dominant",
        "sunrise",
      ],
      timezone: "auto",
    };

    const [response] = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", params);

    const utcOffset = response.utcOffsetSeconds();
    const hourly = response.hourly();
    const daily = response.daily();

    const getTimes = (data) =>
      range(Number(data.time()), Number(data.timeEnd()), data.interval()).map(
        (t) => new Date((t + utcOffset) * 1000)
      );

    const weatherData = {
      hourly: {
        time: getTimes(hourly),
        temperature2m: hourly.variables(0).valuesArray(),
        weatherCode: hourly.variables(1).valuesArray(),
        visibility: hourly.variables(2).valuesArray(),
        windDirection10m: hourly.variables(3).valuesArray(),
        apparentTemperature: hourly.variables(4).valuesArray(),
        precipitation_probability: hourly.variables(5).valuesArray(),
        humidity: hourly.variables(6).valuesArray(),
        windSpeed: hourly.variables(7).valuesArray(),
      },
      daily: {
        time: getTimes(daily),
        weatherCode: daily.variables(0).valuesArray(),
        temperature2mMax: daily.variables(1).valuesArray(),
        temperature2mMin: daily.variables(2).valuesArray(),
        apparentTemperatureMax: daily.variables(3).valuesArray(),
        apparentTemperatureMin: daily.variables(4).valuesArray(),
        sunset: daily.variables(5).valuesArray(),
        uvIndexMax: daily.variables(6).valuesArray(),
        precipitationSum: daily.variables(7).valuesArray(),
        windSpeed10mMax: daily.variables(8).valuesArray(),
        windDirection10mDominant: daily.variables(9).valuesArray(),
        sunrise: daily.variables(10).valuesArray(),
      },
    };

    const { hourlyData, dailyData } = processData(weatherData.hourly, weatherData.daily);

    setHourlyForecastData(hourlyData);
    setDailyForecast(dailyData);
    setDataLoading(false);
    if (switchScreen) setShowResultScreen(true);
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const clickHandler = (searchItem) => {
    setForecastLocation({
      label: searchItem.label,
      lat: searchItem.lat,
      lon: searchItem.lon,
    });
    fetchWeather(searchItem.lat, searchItem.lon, true);
  };

  const currentWeather = hourlyForecastData?.length
    ? hourlyForecastData.filter((hour) => hour.isClosestTime)
    : [];

  return (
    <div className="app">
      <Header />
      {!dataLoading && !showResultScreen && (
        <DefaultScreen
          currentWeatherData={currentWeather}
          forecastLocation={forecastLocation}
          onHandleClick={clickHandler}
        />
      )}
      {showResultScreen && !dataLoading && (<SearchResult  dailyForecast= {dailyForecast} forecastLocation= {forecastLocation} currentWeatherData= {currentWeather}/>)}
      <p className="copyright">&copy; 2025 WSA. All Rights Reserved</p>
    </div>
  );
}

export default App;
