const apiKey = 'cfe7458dea78a6328ad016b9ca50fceb';
let tempUnit = 'toCelsius';

async function getWeatherFrom(city) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
  );
  return await response.json();
}

function convert(kelvin, outputUnit) {
  let output;
  if (outputUnit === 'toCelsius')
    output = Math.round((kelvin - 273.15) * 10) / 10;
  else if (outputUnit === 'toFahrenheit') {
    output = Math.round(((kelvin - 273.15) * 1.8 + 32.0) * 10) / 10;
  } else {
    throw new Error('Incorrect output unit');
  }
  return output;
}

async function handleSearch() {
  const cityInput = document.querySelector('#cityInput');
  const weatherData = await getWeatherFrom(cityInput.value);
  cityInput.value = '';

  renderCard(weatherData);
}

function hoursOf(unixTimestamp, timezoneSeconds) {
  const date = new Date(unixTimestamp * 1000);
  let hours = date.getUTCHours() + timezoneSeconds / 60 / 60;
  let minutes = date.getUTCMinutes();

  if (hours < 0) hours = hours * -1;
  if (hours < 10) hours = `0${hours}`;
  if (minutes < 10) minutes = `0${minutes}`;

  return `${hours}:${minutes}`;
}

function differenceMinutes(unixTimestamp) {
  let difference = Math.round((Date.now() / 1000 - unixTimestamp) / 60);
  if (difference === 0) difference = 1;
  return difference;
}

function toggleTempUnit(e) {
  if (e.target.id !== 'celsiusToggle' || e.target.id !== 'fahrenheitToggle') {
    return;
  }

  if (tempUnit === 'toCelsius') {
    tempUnit = 'toFahrenheit';
    console.log(e.target);
  } else {
    tempUnit = 'toCelsius';
  }

  handleSearch();
}

function renderCard(weatherData) {
  const {
    name: city,
    dt: unixTimestamp,
    weather: {
      0: { description: status },
    },
    main: {
      temp: temp,
      feels_like: feelsLike,
      temp_min: minTemp,
      temp_max: maxTemp,
      pressure: pressure,
      humidity: humidity,
    },
    wind: { deg: windDirection, speed: windSpeed },
    sys: { country: country, sunrise: sunriseTimeID, sunset: sunsetTimeID },
    timezone: timezoneSeconds,
  } = weatherData;

  const requestDifference = differenceMinutes(unixTimestamp);
  const sunriseHour = hoursOf(sunriseTimeID, timezoneSeconds);
  const sunsetHour = hoursOf(sunsetTimeID, timezoneSeconds);

  html = `
          <div class="card-header d-flex flex-column text-center">
            <span id="cityName">${city}</span
            ><span id="currentTime" class="text-muted">${requestDifference} min ago</span>
          </div>
          <div class="card-body">
            <h3 class="card-title my-4 text-center" id="currentWeather" style="text-transform: capitalize">
              ${status}</h3>
          </div>
          <div class="card-body">
            <h6 class="card-text text-center text-muted user-select-none position-relative">Temperature 
              <span class="position-absolute" style="right:18px">
              <a id="celsiusToggle" class="font-weight-bold text-dark" style="cursor:pointer">&deg;C</a> /
              <a id="fahrenheitToggle" class="text-muted" style="cursor:pointer">&deg;F</a>
              </span
            ></h6>
            <ul class="list-group list-group-flush mb-4">
              <li class="list-group-item d-flex justify-content-between">
                <span>Current</span><span id="currentTemp">
                ${convert(temp, tempUnit)}&deg;</span>
              </li>
              <li class="list-group-item d-flex justify-content-between mb-2">
                <span>Feels like</span><span id="feelsLike">
                ${convert(feelsLike, tempUnit)}&deg;</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Min</span><span id="minTemp">
                ${convert(minTemp, tempUnit)}&deg;</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Max</span><span id="maxTemp">
                ${convert(maxTemp, tempUnit)}&deg;</span>
              </li>
            </ul>
            <h6 class="card-text text-center text-muted user-select-none">Wind</h6>
            <ul class="list-group list-group-flush mb-4">
              <li class="list-group-item d-flex justify-content-between">
                <span>Direction</span><span id="windDirection">${windDirection}&deg;</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Speed</span><span id="windSpeed">${windSpeed} m/s</span>
              </li>
            </ul>
            <h6 class="card-text text-center text-muted user-select-none">Others</h6>
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between">
                <span>Sunrise</span><span id="sunriseTime">${sunriseHour}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between mb-2">
                <span>Sunset</span><span id="sunsetTime">${sunsetHour}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Humidity</span><span id="humidity">${humidity}%</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Pressure</span><span id="pressure">${pressure} hPa</span>
              </li>
            </ul>
          </div>
  `;

  document.querySelector('#displayTarget').innerHTML = html;
}

document.querySelector('#cityInputBtn').addEventListener('click', handleSearch);

document
  .querySelector('#displayTarget')
  .addEventListener('click', toggleTempUnit);

document.addEventListener('DOMContentLoaded', async () => {
  const weatherData = await getWeatherFrom('Amsterdam');

  renderCard(weatherData);
});
