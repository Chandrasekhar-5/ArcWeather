export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");

  if (!city) {
    return new Response(
      JSON.stringify({ error: "City is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!env.OPENWEATHER_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing OPENWEATHER_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${env.OPENWEATHER_KEY}`
  );

  return new Response(res.body, {
    headers: { "Content-Type": "application/json" }
  });
}