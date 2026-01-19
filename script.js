console.log("Weather dashboard loaded");

const apiKey = "b8b194e0af47f755994f27a30ba55d45";

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

async function getWeather(city) {
  if (!city) return;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    updateUI(data);

    const { lat, lon } = data.coord;

    await Promise.all([
      getForecast(lat, lon),
      getUVIndex(lat, lon)
    ]);

  } catch (err) {
    alert(err.message);
  }
}

async function getForecast(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  );

  const data = await res.json();
  processForecast(data.list);
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
    const iconClass = weatherIcons[iconCode];

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${new Date(day[0].dt * 1000).toLocaleDateString("en-US", {
        weekday: "short"
      })}</span>
      <i class="${iconClass}"></i>
      <span>${avgTemp}°</span>
    `;

    forecastList.appendChild(li);
  });
}

async function getUVIndex(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`
  );

  const data = await res.json();

  if (!data.current || typeof data.current.uvi !== "number") {
    animateUV(0);
    return;
  }

  animateUV(data.current.uvi);
}

function animateUV(uv) {
  const value = Math.min(uv, UV_MAX);
  const progress = value / UV_MAX;
  const offset = ARC_LENGTH - progress * ARC_LENGTH;

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

function updateUI(data) {
  const { name, sys, main, weather, wind, visibility, dt } = data;

  tempEl.textContent = `${Math.round(main.temp)}°`;
  descEl.textContent = weather[0].description;
  feelsEl.textContent = `${Math.round(main.feels_like)}°`;
  humidityEl.textContent = `${main.humidity}%`;
  windEl.textContent = `${wind.speed} km/h`;
  visibilityEl.textContent = `${(visibility / 1000).toFixed(1)} km`;

  locationEl.textContent = `${name}, ${sys.country} • ${formatTime(dt)}`;

  iconEl.innerHTML = `<i class="${weatherIcons[weather[0].icon]}"></i>`;
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