console.log("Weather dashboard loaded");

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-6px)";
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0)";
  });
});

const apiKey = "b8b194e0af47f755994f27a30ba55d45";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const tempEl = document.querySelector(".main-weather h1");
const descEl = document.querySelector(".main-weather p");
const infoEl = document.querySelector(".main-weather span");
const mainWeatherIcon = document.querySelector(".weather-icon");
const cards = document.querySelectorAll(".highlights .card");
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
  if (!city.trim()) {
    alert("Please enter a city name");
    return;
  }
  
  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!weatherRes.ok) {
      if (weatherRes.status === 404) {
        throw new Error("City not found");
      }
      throw new Error(`Error: ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();
    
    updateUI(weatherData);

    const { lat, lon } = weatherData.coord;
    
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    
    if (forecastRes.ok) {
      const forecastData = await forecastRes.json();
      processForecastData(forecastData);
    }
    
    getUVIndex(lat, lon);

  } catch (err) {
    alert(err.message);
  }
}

async function getUVIndex(lat, lon) {
  try {
    const mockUV = Math.random() * 11;
    animateUV(mockUV);
    
  } catch (err) {
    animateUV(5.5);
  }
}

function animateUV(uv) {
  if (!uvPath || !uvText) return;
  
  const safeUV = Math.min(uv, UV_MAX);
  const progress = safeUV / UV_MAX;
  const offset = ARC_LENGTH - (progress * ARC_LENGTH);
  
  uvPath.style.strokeDashoffset = offset;
  uvText.innerText = uv.toFixed(1);
  
  const color = getUVColor(uv);
  uvPath.style.stroke = color;
  uvText.style.color = color;
}

function getUVColor(uv) {
  if (uv < 3) return "#4ade80";
  if (uv < 6) return "#facc15";
  if (uv < 8) return "#fb923c";
  if (uv < 11) return "#ef4444";
  return "#a855f7";
}

function processForecastData(forecastData) {
  const dailyForecasts = {};
  
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    
    if (!dailyForecasts[dayKey]) {
      dailyForecasts[dayKey] = {
        date: date,
        temps: [],
        icons: []
      };
    }
    
    dailyForecasts[dayKey].temps.push(item.main.temp);
    dailyForecasts[dayKey].icons.push(item.weather[0].icon);
  });
  
  const next7Days = Object.values(dailyForecasts).slice(1, 8);
  renderForecast(next7Days);
}

function renderForecast(days) {
  if (!forecastList) return;
  
  forecastList.innerHTML = "";
  
  days.forEach(day => {
    const date = day.date.toLocaleDateString("en-US", {
      weekday: "short"
    });
    
    const avgTemp = Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length);
    const iconCode = day.icons[Math.floor(day.icons.length / 2)];
    const iconClass = weatherIcons[iconCode] || "fas fa-cloud";
    
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${date}</span>
      <span><i class="${iconClass}"></i></span>
      <span>${avgTemp}°</span>
    `;
    
    forecastList.appendChild(li);
  });
}

function updateUI(data) {
  const { name, sys, main, weather, wind, visibility, dt } = data;
  
  tempEl.innerHTML = `${Math.round(main.temp)}°`;
  descEl.innerText = weather[0].description;
  
  const currentTime = new Date(dt * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
  
  infoEl.innerHTML = `<i class="fas fa-map-pin"></i> ${name}, ${sys.country} • ${currentTime}`;
  
  const iconCode = weather[0].icon;
  const iconClass = weatherIcons[iconCode] || "fas fa-cloud";
  if (mainWeatherIcon) {
    mainWeatherIcon.innerHTML = `<i class="${iconClass} fa-3x"></i>`;
  }
  
  if (cards[0]) {
    cards[0].querySelector("h2").innerHTML = `${wind.speed} <span>km/h</span>`;
  }
  
  if (cards[1]) {
    cards[1].querySelector(".uv-value").innerText = "0.0";
  }
  
  if (cards[2]) {
    cards[2].innerHTML = `
      <h4><i class="fas fa-sun"></i> Sunrise & Sunset</h4>
      <p><i class="fas fa-sunrise"></i> ${formatTime(sys.sunrise)}</p>
      <p><i class="fas fa-sunset"></i> ${formatTime(sys.sunset)}</p>
    `;
  }
  
  if (cards[3]) {
    cards[3].querySelector("h2").innerText = `${main.humidity}%`;
  }
  
  if (cards[4]) {
    const visibilityKm = visibility ? `${(visibility/1000).toFixed(1)}` : "N/A";
    cards[4].querySelector("h2").innerText = `${visibilityKm} km`;
  }
  
  if (cards[5]) {
    cards[5].querySelector("h2").innerText = `${Math.round(main.feels_like)}°`;
  }
}

function formatTime(unix) {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

cityInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    getWeather(cityInput.value.trim());
    cityInput.value = "";
  }
});

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    getWeather(cityInput.value.trim());
    cityInput.value = "";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    animateUV(7.5);
  }, 500);
  
  setTimeout(() => {
    getWeather("Visakhapatnam");
  }, 1000);
});