import { NextRequest } from 'next/server';

const UPSTREAM_TIMEOUT_MS = 8_000;

const supportedCities: Record<string, string> = {
  Shenzhen: 'Shenzhen,CN',
  'New York': 'New York,US',
};

interface OpenWeatherResponse {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: { temp: number };
  weather: Array<{ main: string; description: string }>;
  wind: { speed: number };
  timezone: number;
}

function isOpenWeatherResponse(value: unknown): value is OpenWeatherResponse {
  if (typeof value !== 'object' || value === null) return false;

  const data = value as Partial<OpenWeatherResponse>;
  return (
    typeof data.name === 'string' &&
    typeof data.sys?.country === 'string' &&
    Number.isFinite(data.sys?.sunrise) &&
    Number.isFinite(data.sys?.sunset) &&
    Number.isFinite(data.main?.temp) &&
    Array.isArray(data.weather) &&
    typeof data.weather[0]?.main === 'string' &&
    typeof data.weather[0]?.description === 'string' &&
    Number.isFinite(data.wind?.speed) &&
    Number.isFinite(data.timezone)
  );
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city');
  const location = city ? supportedCities[city] : undefined;

  if (!location) {
    return Response.json({ error: 'Unsupported weather location' }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    console.error('Weather service is not configured');
    return Response.json({ error: 'Weather service is unavailable' }, { status: 503 });
  }

  const params = new URLSearchParams({ q: location, appid: apiKey, units: 'metric' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`, {
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!upstream.ok) {
      console.error('Weather provider returned an error:', upstream.status);
      return Response.json({ error: 'Weather service is unavailable' }, { status: 502 });
    }

    const data: unknown = await upstream.json();
    if (!isOpenWeatherResponse(data)) {
      console.error('Weather provider returned an invalid response');
      return Response.json({ error: 'Weather service is unavailable' }, { status: 502 });
    }

    return Response.json(
      {
        city: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        windSpeed: data.wind.speed,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        timezone: data.timezone,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    if (controller.signal.aborted) {
      console.error('Weather provider request timed out');
      return Response.json({ error: 'Weather service timed out' }, { status: 504 });
    }

    console.error('Weather provider request failed:', error);
    return Response.json({ error: 'Weather service is unavailable' }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
