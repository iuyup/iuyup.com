'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { CARD_VARIANTS, type CardVariant } from '@/lib/colors';
import { getWeatherTheme, themeColors, type WeatherThemeKey } from '@/lib/weatherThemes';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 50, mass: 0.6 };

// ===================
// Data Layer
// ===================
export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  description: string;
  windSpeed: number;
  sunrise: number;
  sunset: number;
  timezone: number;
}

interface OpenWeatherResponse {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: { temp: number };
  weather: Array<{ main: string; description: string }>;
  wind: { speed: number };
  timezone: number;
}

const CACHE_KEY_PREFIX = 'weather_cache_';
const CACHE_TTL = 10 * 60 * 1000;

function getCachedWeather(city: string): WeatherData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + city);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedWeather(city: string, data: WeatherData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHE_KEY_PREFIX + city, JSON.stringify({ data, timestamp: Date.now() }));
}

async function fetchWeather(city: string): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return getMockWeather(city);
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error('API error');
    const w: OpenWeatherResponse = await res.json();

    const data: WeatherData = {
      city: w.name,
      country: w.sys.country,
      temp: Math.round(w.main.temp),
      condition: w.weather[0].main,
      description: w.weather[0].description,
      windSpeed: w.wind.speed,
      sunrise: w.sys.sunrise,
      sunset: w.sys.sunset,
      timezone: w.timezone,
    };

    setCachedWeather(city, data);
    return data;
  } catch {
    return getCachedWeather(city) ?? getMockWeather(city);
  }
}

function getMockWeather(city: string): WeatherData {
  const mocks: Record<string, WeatherData> = {
    Shenzhen: {
      city: 'Shenzhen',
      country: 'CN',
      temp: 25,
      condition: 'Clear',
      description: 'clear sky',
      windSpeed: 2.0,
      sunrise: 0,
      sunset: 0,
      timezone: 28800,
    },
    'New York': {
      city: 'New York City',
      country: 'USA',
      temp: 12,
      condition: 'Clouds',
      description: 'overcast clouds',
      windSpeed: 3.5,
      sunrise: 0,
      sunset: 0,
      timezone: -18000,
    },
  };
  return mocks[city] ?? mocks['New York'];
}

function isNightTime(weather: WeatherData): boolean {
  if (!weather.sunrise || !weather.sunset) return false;
  const now = Math.floor(Date.now() / 1000);
  return now < weather.sunrise || now > weather.sunset;
}

// ===================
// Animation Helpers
// ===================
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface AnimatedState {
  angle: number;
  radiusPhase: number;
  startPctPhase: number;
  mouseX: number;
  mouseY: number;
  currentInfluence: number;
}

// ===================
// SVG Icons
// ===================
function CloudIcon() {
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none">
      <path
        d="M16 28C10.477 28 6 23.523 6 18S10.477 8 16 8C16.55 8 17.09 8.07 17.61 8.2C18.8 5.18 21.74 3 25.2 3C29.55 3 33.1 6.55 33.1 10.9C33.1 11.3 33.08 11.69 33.04 12.08C35.1 12.51 36.74 14.4 36.74 16.7C36.74 19.32 34.62 21.44 32 21.44H14C9.58 21.44 6 24.74 6 28.8C6 32.86 9.58 36 14 36H52C56.42 36 60 32.86 60 28.8C60 25.26 57.18 22.34 53.79 21.66"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="12" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 32 + Math.cos(rad) * 18;
        const y1 = 32 + Math.sin(rad) * 18;
        const x2 = 32 + Math.cos(rad) * 26;
        const y2 = 32 + Math.sin(rad) * 26;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path
        d="M40 12C33.37 12 27.46 15.11 23.5 20C27.46 24.89 33.37 28 40 28C32.06 28 25.62 34.44 25.62 42.38C25.62 50.32 32.06 56.76 40 56.76C46.14 56.76 51.38 52.76 53.72 47.38C49.74 49.57 45.03 51 40 51C28.95 51 20 42.05 20 31C20 19.95 28.95 11 40 11V12Z"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M16 20C10.477 20 6 15.523 6 10s4.477-10 10-10c.55 0 1.09.07 1.61.2C18.8-1.82 23.74-4 28.2-4c5.55 0 10.1 4.45 10.1 10v.08C40.1 6.75 42.74 9.4 42.74 12.7c0 3.32-2.62 6.3-4.84 6.3H16Z" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {[22, 32, 42].map((x) => (
        <line key={x} x1={x} y1={32} x2={x - 6} y2={48} stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M16 20C10.477 20 6 15.523 6 10s4.477-10 10-10c.55 0 1.09.07 1.61.2C18.8-1.82 23.74-4 28.2-4c5.55 0 10.1 4.45 10.1 10v.08C40.1 6.75 42.74 9.4 42.74 12.7c0 3.32-2.62 6.3-4.84 6.3H16Z" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {[22, 32, 42].map((x) => (
        <g key={x}>
          <line x1={x} y1={32} x2={x} y2={44} stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
          <circle cx={x} cy={50} r="2" fill="rgba(255,255,255,0.6)" />
        </g>
      ))}
    </svg>
  );
}

function getWeatherIcon(condition: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    Clear: <SunIcon />,
    Clouds: <CloudIcon />,
    Rain: <RainIcon />,
    Drizzle: <RainIcon />,
    Snow: <SnowIcon />,
    Thunderstorm: <RainIcon />,
    Mist: <CloudIcon />,
    Fog: <CloudIcon />,
    Haze: <CloudIcon />,
    Wind: <CloudIcon />,
  };
  return map[condition] ?? <CloudIcon />;
}

// ===================
// Component
// ===================
interface WeatherCardProps {
  tag?: CardVariant;
  city?: string;
}

export function WeatherCard({ tag = 'default', city = 'Shenzhen' }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);

  // Animation state
  const animRef = useRef<AnimatedState>({ angle: 0, radiusPhase: 0, startPctPhase: 0, mouseX: 0, mouseY: 0, currentInfluence: 0 });
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });

  // Use refs for animation loop to avoid restarting on state changes
  const isHoveredRef = useRef(false);
  const themeKeyRef = useRef<WeatherThemeKey>('clouds');

  // Theme key
  const [themeKey, setThemeKey] = useState<WeatherThemeKey>('clouds');
  useEffect(() => {
    themeKeyRef.current = themeKey;
    isHoveredRef.current = isHovered;
  }, [themeKey, isHovered]);

  // Fetch weather on mount
  useEffect(() => {
    fetchWeather(city).then((data) => {
      setWeather(data);
      const night = isNightTime(data);
      const key = getWeatherTheme(data.condition, night, data.windSpeed);
      setThemeKey(key);
    });
  }, []);

  // Animation loop via requestAnimationFrame
  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const tick = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const anim = animRef.current;

      // Angle rotation - 16s period
      anim.angle = (anim.angle + (dt / 16) * Math.PI * 2) % (Math.PI * 2);

      // Radius breath - 12s period
      anim.radiusPhase = (anim.radiusPhase + (dt / 12) * Math.PI * 2) % (Math.PI * 2);

      // startPct breath - 8s period
      anim.startPctPhase = (anim.startPctPhase + (dt / 8) * Math.PI * 2) % (Math.PI * 2);

      const radius = (Math.sin(anim.radiusPhase) + 1) / 2;
      const startPct = 15 * anim.currentInfluence;

      // Radius offset
      const baseRadius = 20;
      const radiusOffset = baseRadius * radius;

      // Lerp mouse position
      anim.mouseX = lerp(anim.mouseX, mouseTargetRef.current.x, isHoveredRef.current ? 0.12 : 0.06);
      anim.mouseY = lerp(anim.mouseY, mouseTargetRef.current.y, isHoveredRef.current ? 0.12 : 0.06);

      // Smooth influence transition: hover -> 0.95, leave -> 0
      const targetInfluence = isHoveredRef.current ? 0.95 : 0;
      anim.currentInfluence += (targetInfluence - anim.currentInfluence) * dt * 3;

      // Compute gradient center: fixed center + mouse influence
      // When influence=0, spot starts from center (50); when influence=1, spot follows mouse
      const cx = 50 * (1 - anim.currentInfluence) + anim.mouseX * 100 * anim.currentInfluence;
      const cy = 50 * (1 - anim.currentInfluence) + anim.mouseY * 100 * anim.currentInfluence;
      const clampedX = Math.max(20, Math.min(80, cx));
      const clampedY = Math.max(20, Math.min(80, cy));

      const theme = themeColors[themeKeyRef.current];
      if (bgRef.current) {
        bgRef.current.style.background =
          `radial-gradient(circle at ${clampedX.toFixed(1)}% ${clampedY.toFixed(1)}%, ${theme.startColor} ${startPct.toFixed(0)}%, ${theme.endColor} 100%)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseTargetRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseTargetRef.current = { x: 0.5, y: 0.5 };
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      className="break-inside-avoid mb-6 md:mb-8 card-hover"
      whileHover={{ scale: 1.02 }}
      transition={springTransition}
    >
      <div
        ref={bgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          borderRadius: '1.5rem',
          overflow: 'hidden',
          padding: '3.5rem 2.5rem',
          minHeight: '650px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          cursor: 'pointer',
          color: 'rgb(255,255,255)',
          textAlign: 'center',
          background: themeColors[themeKey].startColor,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* Weather icon */}
        <div style={{ opacity: 0.9 }}>
          {weather ? getWeatherIcon(weather.condition) : <CloudIcon />}
        </div>

        {/* City name */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: '2.5rem', fontWeight: 600 }}>
          {weather ? `${weather.city}, ${weather.country}` : 'Loading...'}
        </div>

        {/* Condition + temp */}
        <div style={{ fontSize: '1.5rem', fontWeight: 500, opacity: 0.9, letterSpacing: '0.1em' }}>
          {weather ? `${weather.condition.toUpperCase()} ${weather.temp}°C` : ''}
        </div>
      </div>
    </motion.div>
  );
}