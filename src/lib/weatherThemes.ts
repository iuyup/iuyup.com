export type WeatherCondition =
  | 'Clear'
  | 'Clouds'
  | 'Rain'
  | 'Drizzle'
  | 'Snow'
  | 'Thunderstorm'
  | 'Mist'
  | 'Fog'
  | 'Haze'
  | 'Wind';

export type WeatherThemeKey =
  | 'sunny'
  | 'clear-night'
  | 'clouds'
  | 'rainy'
  | 'snow'
  | 'windy'
  | 'default';

export interface WeatherTheme {
  startColor: string;
  endColor: string;
  startPct: number;
}

// weather[0].main → WeatherThemeKey
export const weatherThemes: Record<WeatherCondition, WeatherThemeKey> = {
  Clear: 'sunny',
  Clouds: 'clouds',
  Rain: 'rainy',
  Drizzle: 'rainy',
  Snow: 'snow',
  Thunderstorm: 'rainy',
  Mist: 'clouds',
  Fog: 'clouds',
  Haze: 'clouds',
  Wind: 'windy',
};

export const themeColors: Record<WeatherThemeKey, WeatherTheme> = {
  sunny: { startColor: 'rgb(135, 180, 220)', endColor: 'rgb(95, 145, 185)', startPct: 0 },
  'clear-night': { startColor: 'rgb(60, 50, 100)', endColor: 'rgb(30, 25, 60)', startPct: 0 },
  clouds: { startColor: 'rgb(131, 138, 148)', endColor: 'rgb(57, 64, 74)', startPct: 0 },
  rainy: { startColor: 'rgb(100, 130, 160)', endColor: 'rgb(50, 70, 100)', startPct: 0 },
  snow: { startColor: 'rgb(220, 230, 240)', endColor: 'rgb(180, 200, 220)', startPct: 0 },
  windy: { startColor: 'rgb(140, 180, 180)', endColor: 'rgb(80, 120, 130)', startPct: 0 },
  default: { startColor: 'rgb(131, 138, 148)', endColor: 'rgb(57, 64, 74)', startPct: 0 },
};

export function getWeatherTheme(
  condition: string,
  isNight: boolean,
  windSpeed?: number
): WeatherThemeKey {
  const base = weatherThemes[condition as WeatherCondition] ?? 'default';

  // Wind override
  if (windSpeed !== undefined && windSpeed > 10 && base !== 'snow') {
    return 'windy';
  }

  // Night override for Clear
  if (base === 'sunny' && isNight) {
    return 'clear-night';
  }

  return base;
}