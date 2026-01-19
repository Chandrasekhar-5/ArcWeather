
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

  } catch (err) {
    alert("City not found ❌");
  }
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
  cards[4].querySelector("h2").innerText = `${(visibility/1000).toFixed(1)} km`;
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