console.log("Weather dashboard loaded");
const ENABLE_MAP = false;

const mapboxToken = "YOUR_MAPBOX_PUBLIC_TOKEN";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const locationEl = document.getElementById("location");
const iconEl = document.getElementById("mainWeatherIcon");

const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humidity");
const visibilityEl = document.getElementById("visibility");
const feelsEl = document.getElementById("feels");

const uvPath = document.querySelector(".uv-progress");
const uvText = document.getElementById("uvValue");

const forecastList = document.getElementById("forecastList");

const UV_MAX = 11;
const ARC_LENGTH = 251;

const weatherIcons = {
  "01d": "fas fa-sun",
  "01n": "fas fa-moon",
  "02d": "fas fa-cloud-sun",
  "02n": "fas fa-cloud-moon",
  "03d": "fas fa-cloud",
  "03n": "fas fa-cloud",
  "04d": "fas fa-cloud",
  "04n": "fas fa-cloud",
  "09d": "fas fa-cloud-rain",
  "09n": "fas fa-cloud-rain",
  "10d": "fas fa-cloud-sun-rain",
  "10n": "fas fa-cloud-moon-rain",
  "11d": "fas fa-bolt",
  "11n": "fas fa-bolt",
  "13d": "fas fa-snowflake",
  "13n": "fas fa-snowflake",
  "50d": "fas fa-smog",
  "50n": "fas fa-smog"
};

let map = null;

async function getWeather(city) {
  if (!city) return;

  try {
    const res = await fetch(`/api/weather?city=${city}`);

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    updateUI(data);

    const { lat, lon } = data.coord;

    getForecast(lat, lon);

  } catch (err) {
    alert(err.message);
  }
}

async function getForecast(lat, lon) {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

  const data = await res.json();
  processForecast(data.list);
}

function getDayDuration(sunrise, sunset) {
  const hours = ((sunset - sunrise) / 3600).toFixed(1);
  return `${hours} hrs daylight`;
}

function humidityLabel(h) {
  if (h < 30) return "Dry";
  if (h < 60) return "Comfortable";
  return "Humid";
}

function feelsComparison(temp, feels) {
  if (feels > temp + 2) return "Feels warmer";
  if (feels < temp - 2) return "Feels cooler";
  return "Feels normal";
}

function windDirection(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}


function processForecast(list) {
  const days = {};

  list.forEach(item => {
    const key = new Date(item.dt * 1000).toDateString();
    if (!days[key]) days[key] = [];
    days[key].push(item);
  });

  renderForecast(Object.values(days).slice(1, 8));
}

function renderForecast(days) {
  forecastList.innerHTML = "";

  days.forEach(day => {
    const avgTemp = Math.round(
      day.reduce((sum, d) => sum + d.main.temp, 0) / day.length
    );

    const iconCode = day[Math.floor(day.length / 2)].weather[0].icon;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${new Date(day[0].dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}</span>
      <i class="${weatherIcons[iconCode]}"></i>
      <span>${avgTemp}°</span>
    `;
    forecastList.appendChild(li);
  });
}

function calculateUV(data) {
  const hour = new Date(data.dt * 1000).getHours();
  const sunFactor = Math.max(0, Math.sin((Math.PI * (hour - 6)) / 12));
  const cloudFactor = 1 - data.clouds.all / 100;
  return Math.min(11, Math.max(0, sunFactor * cloudFactor * 11));
}

function animateUV(uv) {
  const value = Math.min(uv, UV_MAX);
  const offset = ARC_LENGTH - (value / UV_MAX) * ARC_LENGTH;

  uvPath.style.strokeDashoffset = offset;
  uvPath.style.stroke = getUVColor(value);
  uvText.textContent = value.toFixed(1);
}

function getUVColor(uv) {
  if (uv < 3) return "#4ade80";
  if (uv < 6) return "#facc15";
  if (uv < 8) return "#fb923c";
  if (uv < 11) return "#ef4444";
  return "#a855f7";
}

function updateWindGraph(speed) {
  const base = 80;
  const points = Array.from({ length: 6 }, (_, i) => {
    const x = i * 60;
    const y = base - Math.random() * speed * 2;
    return `${x},${y}`;
  }).join(" ");

  const line = document.querySelector(".wind-line");
  if (line) line.setAttribute("points", points);
}

function initMap(lat, lon) {
  if (!ENABLE_MAP) return;
}

function updateUI(data) {
  tempEl.textContent = `${Math.round(data.main.temp)}°`;
  descEl.textContent = data.weather[0].description;
  feelsEl.textContent = `${Math.round(data.main.feels_like)}°`;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${data.wind.speed} km/h`;
  visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

  document.getElementById("sun").innerHTML = `
  ${formatTime(data.sys.sunrise)} / ${formatTime(data.sys.sunset)}
  <small style="display:block;opacity:.7;margin-top:6px">
    ${getDayDuration(data.sys.sunrise, data.sys.sunset)}
  </small>
`;

humidityEl.innerHTML = `
  ${data.main.humidity}%
  <small style="display:block;opacity:.7;margin-top:6px">
    ${humidityLabel(data.main.humidity)}
  </small>
`;

feelsEl.innerHTML = `
  ${Math.round(data.main.feels_like)}°
  <small style="display:block;opacity:.7;margin-top:6px">
    ${feelsComparison(data.main.temp, data.main.feels_like)}
  </small>
`;

windEl.innerHTML = `
  ${data.wind.speed} km/h
  <small style="display:block;opacity:.7;margin-top:6px">
    Direction: ${windDirection(data.wind.deg)}
  </small>
`;

  locationEl.textContent =
    `${data.name}, ${data.sys.country} • ${formatTime(data.dt)}`;

  iconEl.innerHTML = `<i class="${weatherIcons[data.weather[0].icon]}"></i>`;

  animateUV(calculateUV(data));
  updateWindGraph(data.wind.speed);
}

function formatTime(unix) {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

searchBtn.addEventListener("click", () => {
  getWeather(cityInput.value.trim());
  cityInput.value = "";
});

cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    getWeather(cityInput.value.trim());
    cityInput.value = "";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  getWeather("Visakhapatnam");
});