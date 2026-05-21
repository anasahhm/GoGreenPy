import React, { useEffect, useState } from 'react';

/*
  WeatherWidget — compact horizontal inline bar, designed to sit in a header row.
  Props:
    apiKey — VITE_OWM_API_KEY
  Usage:
    <WeatherWidget apiKey={import.meta.env.VITE_OWM_API_KEY} />
*/

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  .ww-bar {
    font-family: "Geist Mono", monospace;
    display: inline-flex;
    align-items: center;
    gap: 0;
    border: 1px solid rgba(0,0,0,0.13);
    border-radius: 4px;
    background: #fff;
    overflow: hidden;
    height: 36px;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    white-space: nowrap;
  }
  .ww-bar:hover {
    border-color: rgba(0,0,0,0.22);
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }

  /* location pill — dark left cap */
  .ww-bar-loc {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: #0e0e0e;
    padding: 0 0.75rem;
    height: 100%;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }
  .ww-bar-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #22c55e;
    flex-shrink: 0;
  }
  .ww-bar-city {
    color: rgba(255,255,255,0.75);
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* divider */
  .ww-bar-sep {
    width: 1px;
    height: 100%;
    background: rgba(0,0,0,0.1);
    flex-shrink: 0;
  }

  /* temp */
  .ww-bar-temp {
    display: flex;
    align-items: baseline;
    gap: 1px;
    padding: 0 0.75rem;
    height: 100%;
    align-items: center;
  }
  .ww-bar-temp-val {
    font-size: 0.92rem;
    font-weight: 700;
    color: #111;
    letter-spacing: -0.02em;
  }
  .ww-bar-temp-unit {
    font-size: 0.65rem;
    color: rgba(0,0,0,0.35);
    font-weight: 600;
  }

  /* condition */
  .ww-bar-cond {
    padding: 0 0.75rem 0 0;
    font-size: 0.65rem;
    color: rgba(0,0,0,0.42);
    text-transform: capitalize;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* metrics — each chip */
  .ww-bar-chips {
    display: flex;
    align-items: center;
    gap: 0;
    height: 100%;
    border-left: 1px solid rgba(0,0,0,0.08);
  }
  .ww-bar-chip {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0 0.65rem;
    height: 100%;
    border-right: 1px solid rgba(0,0,0,0.06);
    font-size: 0.62rem;
  }
  .ww-bar-chip:last-child { border-right: none; }
  .ww-bar-chip-key {
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.3);
  }
  .ww-bar-chip-val {
    font-weight: 700;
    color: #111;
  }
  .ww-bar-badge {
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 0.1rem 0.35rem;
    border-radius: 2px;
  }

  /* AQI badge colours */
  .aqi-good  { background: rgba(22,163,74,0.12);  color: #15803d; }
  .aqi-fair  { background: rgba(234,179,8,0.15);  color: #854d0e; }
  .aqi-mod   { background: rgba(249,115,22,0.15); color: #9a3412; }
  .aqi-poor  { background: rgba(185,28,28,0.12);  color: #991b1b; }
  .aqi-vbad  { background: rgba(109,40,217,0.12); color: #5b21b6; }

  /* UV badge colours */
  .uv-low    { background: rgba(22,163,74,0.12);  color: #15803d; }
  .uv-mod    { background: rgba(234,179,8,0.15);  color: #854d0e; }
  .uv-high   { background: rgba(249,115,22,0.15); color: #9a3412; }
  .uv-vhigh  { background: rgba(185,28,28,0.12);  color: #991b1b; }

  /* skeleton / error states */
  .ww-bar-skeleton {
    padding: 0 1rem;
    font-size: 0.65rem;
    color: rgba(0,0,0,0.3);
    letter-spacing: 0.08em;
    height: 100%;
    display: flex;
    align-items: center;
  }
  @keyframes ww-blink {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 0.9;  }
  }
  .ww-bar-skeleton { animation: ww-blink 1.4s ease infinite; }

  /* hide chips on narrow screens */
  @media (max-width: 768px) {
    .ww-bar-chips { display: none; }
    .ww-bar-cond  { display: none; }
  }
  @media (max-width: 500px) {
    .ww-bar { display: none; }
  }
`;

/* ── helpers ─────────────────────────────────────────────────────────────── */
const AQI_MAP = {
  1: { label: 'Good', cls: 'aqi-good' },
  2: { label: 'Fair', cls: 'aqi-fair' },
  3: { label: 'Mod',  cls: 'aqi-mod'  },
  4: { label: 'Poor', cls: 'aqi-poor' },
  5: { label: 'Bad',  cls: 'aqi-vbad' },
};

const uvInfo = (uv) => {
  if (uv <= 2)  return { label: 'Low',    cls: 'uv-low'   };
  if (uv <= 5)  return { label: 'Mod',    cls: 'uv-mod'   };
  if (uv <= 7)  return { label: 'High',   cls: 'uv-high'  };
  if (uv <= 10) return { label: 'V-High', cls: 'uv-vhigh' };
  return              { label: 'Extreme', cls: 'uv-vhigh'  };
};

/* ── Component ───────────────────────────────────────────────────────────── */
const WeatherWidget = ({ apiKey }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState('');
  const [coords,  setCoords ] = useState(null);

  /* Step 1: geolocation */
  useEffect(() => {
    if (!apiKey) {
      setError('No API key');
      setLoading(false);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        ()    => setCoords({ lat: 22.7196, lon: 75.8577 })
      );
    } else {
      setCoords({ lat: 22.7196, lon: 75.8577 });
    }
  }, [apiKey]);

  /* Step 2: fetch */
  useEffect(() => {
    if (!coords || !apiKey) return;
    const { lat, lon } = coords;

    const go = async () => {
      try {
        const [wRes, aqiRes, uvRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`),
          // /uvi is free tier — do NOT use /onecall (paid only)
          fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`),
        ]);
        if (!wRes.ok) throw new Error(`${wRes.status}`);
        const [w, aqi, uv] = await Promise.all([wRes.json(), aqiRes.json(), uvRes.json()]);
        setWeather({
          temp:      Math.round(w.main.temp),
          feelsLike: Math.round(w.main.feels_like),
          humidity:  w.main.humidity,
          condition: w.weather[0]?.description || '—',
          cityName:  w.name,
          aqi:       aqi?.list?.[0]?.main?.aqi ?? null,
          uvIndex:   Math.round(uv?.value ?? 0),
          windSpeed: Math.round((w.wind?.speed ?? 0) * 3.6),
        });
      } catch (e) {
        setError('Weather unavailable');
      } finally {
        setLoading(false);
      }
    };
    go();
  }, [coords, apiKey]);

  return (
    <>
      <style>{styles}</style>
      <div className="ww-bar">
        {/* Loading */}
        {loading && <span className="ww-bar-skeleton">fetching weather…</span>}

        {/* Error */}
        {!loading && error && (
          <span className="ww-bar-skeleton" style={{ animation: 'none', color: '#b91c1c' }}>
            {error}
          </span>
        )}

        {/* Data */}
        {!loading && weather && (
          <>
            {/* Location cap */}
            <div className="ww-bar-loc">
              <span className="ww-bar-dot" />
              <span className="ww-bar-city">{weather.cityName}</span>
            </div>

            {/* Temp */}
            <div className="ww-bar-temp">
              <span className="ww-bar-temp-val">{weather.temp}</span>
              <span className="ww-bar-temp-unit">°C</span>
            </div>

            {/* Condition */}
            <span className="ww-bar-cond">{weather.condition}</span>

            {/* Metric chips */}
            <div className="ww-bar-chips">
              <div className="ww-bar-chip">
                <span className="ww-bar-chip-key">Hum</span>
                <span className="ww-bar-chip-val">{weather.humidity}%</span>
              </div>

              {weather.aqi !== null && (
                <div className="ww-bar-chip">
                  <span className="ww-bar-chip-key">AQI</span>
                  <span className={`ww-bar-badge ${AQI_MAP[weather.aqi]?.cls}`}>
                    {AQI_MAP[weather.aqi]?.label}
                  </span>
                </div>
              )}

              <div className="ww-bar-chip">
                <span className="ww-bar-chip-key">UV</span>
                <span className={`ww-bar-badge ${uvInfo(weather.uvIndex).cls}`}>
                  {uvInfo(weather.uvIndex).label}
                </span>
              </div>

              <div className="ww-bar-chip">
                <span className="ww-bar-chip-key">Wind</span>
                <span className="ww-bar-chip-val">{weather.windSpeed} km/h</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default WeatherWidget;

/* ── Reusable hook (uses /uvi, not /onecall — free tier safe) ─────────────── */
export const useWeatherData = (apiKey) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState('');

  useEffect(() => {
    if (!apiKey) { setLoading(false); return; }

    const getWeather = async (lat, lon) => {
      try {
        const [wRes, aqiRes, uvRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`),
          fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`),
        ]);
        const [w, aqi, uv] = await Promise.all([wRes.json(), aqiRes.json(), uvRes.json()]);
        setWeather({
          temp:      Math.round(w.main.temp),
          feelsLike: Math.round(w.main.feels_like),
          humidity:  w.main.humidity,
          condition: w.weather[0]?.description,
          cityName:  w.name,
          aqi:       aqi?.list?.[0]?.main?.aqi ?? null,
          uvIndex:   Math.round(uv?.value ?? 0),
          windSpeed: Math.round((w.wind?.speed ?? 0) * 3.6),
        });
      } catch { setError('Weather unavailable'); }
      finally  { setLoading(false); }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => getWeather(p.coords.latitude, p.coords.longitude),
        ()  => getWeather(22.7196, 75.8577)
      );
    } else {
      getWeather(22.7196, 75.8577);
    }
  }, [apiKey]);

  return { weather, loading, error };
};