export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  const city = url.searchParams.get("city");
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");

  if (city) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${env.OPENWEATHER_KEY}`
    );
    return new Response(res.body, {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (lat && lon) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${env.OPENWEATHER_KEY}`
    );
    return new Response(res.body, {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(
    JSON.stringify({ error: "Invalid request" }),
    { status: 400 }
  );
}