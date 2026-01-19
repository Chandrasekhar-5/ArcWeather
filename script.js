
console.log("Weathry dashboard loaded");

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

const tempEl = document.querySelector(".main-weather h1");
const descEl = document.querySelector(".main-weather p");
const infoEl = document.querySelector(".main-weather span");

const cards = document.querySelectorAll(".highlights .card");

async function getWeather(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    updateUI(data);

    const { lat, lon } = data.coord; 
    get7DayForecast(lat, lon);

  } catch (err) {
    alert("City not found ❌");
  }
}

const uvPath = document.querySelector(".uv-progress");
const uvText = document.getElementById("uvValue");

const UV_MAX = 11;
const ARC_LENGTH = 251;

function animateUV(uv) {
  const safeUV = Math.min(uv, UV_MAX);
  const progress = safeUV / UV_MAX;
  const offset = ARC_LENGTH - progress * ARC_LENGTH;

  uvPath.style.strokeDashoffset = offset;
  uvText.innerText = uv.toFixed(1);

  uvPath.style.stroke = getUVColor(uv);
}

function getUVColor(uv) {
  if (uv < 3) return "#4ade80";
  if (uv < 6) return "#facc15";
  if (uv < 8) return "#fb923c";
  if (uv < 11) return "#ef4444";
  return "#a855f7";
}


async function get7DayForecast(lat, lon) {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`
    );

    const data = await res.json();

    animateUV(data.current.uvi);
    renderForecast(data.daily);
}

const forecastList = document.getElementById("forecastList");

function renderForecast(days) {
    forecastList.innerHTML = "";

    days.slice(1, 8).forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString("en-us", {
            weekday: "short"
        });

        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${date}</span>
            <img src = "${icon}" alt = "${day.weather[0].description}">
            <span>${Math.round(day.temp.max)}° / ${Math.round(day.temp.min)}°</span>
        `;

        forecastList.appendChild(li);
    });
}

function updateUI(data) {
  const {
    name,
    sys,
    main,
    weather,
    wind,
    visibility
  } = data;

  tempEl.innerHTML = `${Math.round(main.temp)}°`;
  descEl.innerText = weather[0].description;
  infoEl.innerText = `${name}, ${sys.country}`;

  cards[0].querySelector("h2").innerHTML =
    `${wind.speed} <span>km/h</span>`;

  cards[1].querySelector("h2").innerText =
    Math.round(data.uvi || 5.5);

  cards[2].innerHTML = `
    <h4>Sunrise & Sunset</h4>
    <p> ${formatTime(sys.sunrise)}</p>
    <p> ${formatTime(sys.sunset)}</p>
  `;

  cards[3].querySelector("h2").innerText = `${main.humidity}%`;
  cards[4].querySelector("h2").innerText = visibility ? `${(visibility/1000).toFixed(1)} km` : "N/A";
  cards[5].querySelector("h2").innerText = `${Math.round(main.feels_like)}°`;
}

function formatTime(unix) {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

cityInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    getWeather(cityInput.value);
    cityInput.value = "";
  }
});

getWeather("Visakhapatnam");