import React, { useState, useEffect } from "react";
import moment from "moment";
import CardLayout from "../components/ui/CardLayout";
import Temperature from "../assets/images/temperature.svg";
import Eye from "../assets/images/eye.svg";
import ThermoMini from "../assets/images/temperature-mini.svg";
import Windy from "../assets/images/windy.svg";
import Water from "../assets/images/water.svg";
import Cloud from "../assets/images/cloud.svg";
import Search from "../assets/images/search.svg";
import { weatherCodesMapping } from "../utils";

const DefaultScreen = ({ currentWeatherData, forecastLocation, onHandleClick }) => {
  const [searchCityText, setSearchCityText] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async function (label) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${label}&format=json&addressdetails=1`
    );
    const datas = await response.json();
    const tempSuggestions = [];
    datas.forEach((data) => {
      tempSuggestions.push({
        label: `${
          data?.address?.village ??
          data?.address?.suburb ??
          data?.address?.town ??
          data?.address?.city
        }, ${data?.address?.state}, ${data?.address?.country}`,
        lat: data.lat,
        lon: data.lon,
      });
    });
    setSuggestions(tempSuggestions);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSuggestions(searchCityText);
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [searchCityText]);

  return (
    <div className="home-main-div">
      <div className="default-home-container">
        {/* Weather Info Card */}
        <CardLayout>
          {currentWeatherData?.length && currentWeatherData[0] && (
            <>
              <div className="default-card-city">
                <img
                  src={weatherCodesMapping[currentWeatherData[0]?.values?.weatherCode]?.img}
                  alt="sun"
                />
                <div>
                  <p className="city-name">{forecastLocation?.label}</p>
                  <p className="date-today">
                    {moment(currentWeatherData[0]?.date).format("ddd DD/MM/YYYY")}
                  </p>
                </div>
              </div>

              <div className="temp-container">
                <img src={Temperature} className="thermometer-img" alt="temperature" />
                <div>
                  <p className="temperature-value">
                    {parseFloat(currentWeatherData[0]?.values.temperature2m).toFixed(0)}
                  </p>
                  <p className="text-capitalize">
                    {currentWeatherData[0]?.values.weatherCondition}
                  </p>
                </div>
              </div>
              <p className="DefaultScreen-unit">°C</p>

              <div className="weather-info-row">
                <div className="weather-info-subtitle">
                  <div className="flex">
                    <img src={Eye} alt="eye" />
                    <p className="weather-params-label">Visibility</p>
                  </div>
                  <p>{Math.floor(currentWeatherData[0].values?.visibility / 1000)} km</p>
                </div>
                <p className="divider">|</p>
                <div className="weather-info-subtitle">
                  <div className="flex">
                    <img src={ThermoMini} alt="feels like" />
                    <p className="weather-params-label">Feels like</p>
                  </div>
                  <p>{Math.floor(currentWeatherData[0].values?.apparentTemperature)}°C</p>
                </div>
              </div>

              <div className="weather-info-row secondary">
                <div className="weather-info-subtitle">
                  <div className="flex">
                    <img src={Water} alt="humidity" />
                    <p className="weather-params-label">Humidity</p>
                  </div>
                  <p>{Math.floor(currentWeatherData[0].values?.humidity)}%</p>
                </div>
                <p className="divider">|</p>
                <div className="weather-info-subtitle">
                  <div className="flex">
                    <img src={Windy} alt="wind" />
                    <p className="weather-params-label">Wind Speed</p>
                  </div>
                  <p>
                    {" "}
                    {parseFloat(currentWeatherData[0].values?.windSpeed).toFixed(0)} {" "}
                    km/hr {" "}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardLayout>

        {/* Search City Card */}
        <CardLayout>
          <div className="search-card">
            <div className="flex justify-center">
              <img src={Cloud} alt="cloud" />
            </div>

            <div className="search-city-container city-results">
              <img src={Search} className="search-icon" alt="search" />
              <input
                type="text"
                className="city-input"
                placeholder="Search City"
                value={searchCityText}
                onChange={(e) => setSearchCityText(e.target.value)}
              />
            </div>

            <div className="search-city-suggestions">
              {suggestions?.length > 0 &&
                suggestions.map((suggestionItem, index) =>
                  index < 4 ? (
                    <p
                      className="suggested-label"
                      key={index}
                      onClick={() => onHandleClick(suggestionItem)}
                    >
                      {suggestionItem.label}
                    </p>
                  ) : null
                )}
            </div>
          </div>
        </CardLayout>
      </div>
    </div>
  );
};

export default DefaultScreen;

