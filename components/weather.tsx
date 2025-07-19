'use client';

import cx from 'classnames';
import { format, isWithinInterval } from 'date-fns';
import { useEffect, useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

interface WeatherAtLocation {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  location?: string;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
  daily_units: {
    time: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
}

const SAMPLE = {
  latitude: 37.763283,
  longitude: -122.41286,
  generationtime_ms: 0.027894973754882812,
  utc_offset_seconds: 0,
  timezone: 'GMT',
  timezone_abbreviation: 'GMT',
  elevation: 18,
  current_units: { time: 'iso8601', interval: 'seconds', temperature_2m: '°C' },
  current: { time: '2024-10-07T19:30', interval: 900, temperature_2m: 29.3 },
  hourly_units: { time: 'iso8601', temperature_2m: '°C' },
  hourly: {
    time: [
      '2024-10-07T00:00',
      '2024-10-07T01:00',
      '2024-10-07T02:00',
      '2024-10-07T03:00',
      '2024-10-07T04:00',
      '2024-10-07T05:00',
      '2024-10-07T06:00',
      '2024-10-07T07:00',
      '2024-10-07T08:00',
      '2024-10-07T09:00',
      '2024-10-07T10:00',
      '2024-10-07T11:00',
      '2024-10-07T12:00',
      '2024-10-07T13:00',
      '2024-10-07T14:00',
      '2024-10-07T15:00',
      '2024-10-07T16:00',
      '2024-10-07T17:00',
      '2024-10-07T18:00',
      '2024-10-07T19:00',
      '2024-10-07T20:00',
      '2024-10-07T21:00',
      '2024-10-07T22:00',
      '2024-10-07T23:00',
      '2024-10-08T00:00',
      '2024-10-08T01:00',
      '2024-10-08T02:00',
      '2024-10-08T03:00',
      '2024-10-08T04:00',
      '2024-10-08T05:00',
      '2024-10-08T06:00',
      '2024-10-08T07:00',
      '2024-10-08T08:00',
      '2024-10-08T09:00',
      '2024-10-08T10:00',
      '2024-10-08T11:00',
      '2024-10-08T12:00',
      '2024-10-08T13:00',
      '2024-10-08T14:00',
      '2024-10-08T15:00',
      '2024-10-08T16:00',
      '2024-10-08T17:00',
      '2024-10-08T18:00',
      '2024-10-08T19:00',
      '2024-10-08T20:00',
      '2024-10-08T21:00',
      '2024-10-08T22:00',
      '2024-10-08T23:00',
      '2024-10-09T00:00',
      '2024-10-09T01:00',
      '2024-10-09T02:00',
      '2024-10-09T03:00',
      '2024-10-09T04:00',
      '2024-10-09T05:00',
      '2024-10-09T06:00',
      '2024-10-09T07:00',
      '2024-10-09T08:00',
      '2024-10-09T09:00',
      '2024-10-09T10:00',
      '2024-10-09T11:00',
      '2024-10-09T12:00',
      '2024-10-09T13:00',
      '2024-10-09T14:00',
      '2024-10-09T15:00',
      '2024-10-09T16:00',
      '2024-10-09T17:00',
      '2024-10-09T18:00',
      '2024-10-09T19:00',
      '2024-10-09T20:00',
      '2024-10-09T21:00',
      '2024-10-09T22:00',
      '2024-10-09T23:00',
      '2024-10-10T00:00',
      '2024-10-10T01:00',
      '2024-10-10T02:00',
      '2024-10-10T03:00',
      '2024-10-10T04:00',
      '2024-10-10T05:00',
      '2024-10-10T06:00',
      '2024-10-10T07:00',
      '2024-10-10T08:00',
      '2024-10-10T09:00',
      '2024-10-10T10:00',
      '2024-10-10T11:00',
      '2024-10-10T12:00',
      '2024-10-10T13:00',
      '2024-10-10T14:00',
      '2024-10-10T15:00',
      '2024-10-10T16:00',
      '2024-10-10T17:00',
      '2024-10-10T18:00',
      '2024-10-10T19:00',
      '2024-10-10T20:00',
      '2024-10-10T21:00',
      '2024-10-10T22:00',
      '2024-10-10T23:00',
      '2024-10-11T00:00',
      '2024-10-11T01:00',
      '2024-10-11T02:00',
      '2024-10-11T03:00',
    ],
    temperature_2m: [
      36.6, 32.8, 29.5, 28.6, 29.2, 28.2, 27.5, 26.6, 26.5, 26, 25, 23.5, 23.9,
      24.2, 22.9, 21, 24, 28.1, 31.4, 33.9, 32.1, 28.9, 26.9, 25.2, 23, 21.1,
      19.6, 18.6, 17.7, 16.8, 16.2, 15.5, 14.9, 14.4, 14.2, 13.7, 13.3, 12.9,
      12.5, 13.5, 15.8, 17.7, 19.6, 21, 21.9, 22.3, 22, 20.7, 18.9, 17.9, 17.3,
      17, 16.7, 16.2, 15.6, 15.2, 15, 15, 15.1, 14.8, 14.8, 14.9, 14.7, 14.8,
      15.3, 16.2, 17.9, 19.6, 20.5, 21.6, 21, 20.7, 19.3, 18.7, 18.4, 17.9,
      17.3, 17, 17, 16.8, 16.4, 16.2, 16, 15.8, 15.7, 15.4, 15.4, 16.1, 16.7,
      17, 18.6, 19, 19.5, 19.4, 18.5, 17.9, 17.5, 16.7, 16.3, 16.1,
    ],
  },
  daily_units: {
    time: 'iso8601',
    sunrise: 'iso8601',
    sunset: 'iso8601',
  },
  daily: {
    time: [
      '2024-10-07',
      '2024-10-08',
      '2024-10-09',
      '2024-10-10',
      '2024-10-11',
    ],
    sunrise: [
      '2024-10-07T07:15',
      '2024-10-08T07:16',
      '2024-10-09T07:17',
      '2024-10-10T07:18',
      '2024-10-11T07:19',
    ],
    sunset: [
      '2024-10-07T19:00',
      '2024-10-08T18:58',
      '2024-10-09T18:57',
      '2024-10-10T18:55',
      '2024-10-11T18:54',
    ],
  },
};

function n(num: number): number {
  return Math.ceil(num);
}

export function Weather({
  weatherAtLocation = SAMPLE,
}: {
  weatherAtLocation?: WeatherAtLocation;
}) {
  const currentHigh = Math.max(
    ...weatherAtLocation.hourly.temperature_2m.slice(0, 24),
  );
  const currentLow = Math.min(
    ...weatherAtLocation.hourly.temperature_2m.slice(0, 24),
  );

  const isDay = isWithinInterval(new Date(weatherAtLocation.current.time), {
    start: new Date(weatherAtLocation.daily.sunrise[0]),
    end: new Date(weatherAtLocation.daily.sunset[0]),
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hoursToShow = isMobile ? 5 : 6;
  const currentTimeIndex = weatherAtLocation.hourly.time.findIndex(
    (time) => new Date(time) >= new Date(weatherAtLocation.current.time),
  );
  const displayTimes = weatherAtLocation.hourly.time.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow,
  );
  const displayTemperatures = weatherAtLocation.hourly.temperature_2m.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow,
  );

  const currentTemp = weatherAtLocation.current.temperature_2m;
  const isHighTemp = currentTemp > 30;
  const isLowTemp = currentTemp < 15;
  const isModerateTemp = !isHighTemp && !isLowTemp;

  const getCardStyles = () => {
    if (isHighTemp) {
      return isDay
        ? 'bg-gradient-to-br from-red-400/50 to-orange-400/50 border border-red-300/50 animate-heatWave'
        : 'bg-gradient-to-br from-red-600/50 to-orange-600/50 border border-red-400/50 animate-heatWave';
    } else if (isLowTemp) {
      return isDay
        ? 'bg-gradient-to-br from-blue-300/50 to-cyan-300/50 border border-blue-200/50 animate-coolBreeze'
        : 'bg-gradient-to-br from-blue-700/50 to-cyan-700/50 border border-blue-300/50 animate-coolBreeze';
    } else {
      return isDay
        ? 'bg-gradient-to-br from-blue-200/50 to-green-200/50 border border-blue-100/50 animate-calmFade'
        : 'bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-indigo-200/50 animate-calmFade';
    }
  };

  const getIconStyles = () => {
    if (isHighTemp) {
      return isDay
        ? 'bg-gradient-to-br from-red-400 to-yellow-400 animate-pulse'
        : 'bg-gradient-to-br from-red-600 to-orange-600 animate-pulse';
    } else if (isLowTemp) {
      return isDay
        ? 'bg-gradient-to-br from-blue-300 to-cyan-300 animate-pulse'
        : 'bg-gradient-to-br from-blue-600 to-cyan-600 animate-pulse';
    } else {
      return isDay
        ? 'bg-gradient-to-br from-blue-300 to-green-300 animate-pulse'
        : 'bg-gradient-to-br from-indigo-400 to-blue-400 animate-pulse';
    }
  };

  const getHourlyIconStyles = (temp: number) => {
    if (temp > 30) {
      return isDay
        ? 'bg-gradient-to-br from-red-300 to-yellow-300'
        : 'bg-gradient-to-br from-red-500 to-orange-500';
    } else if (temp < 15) {
      return isDay
        ? 'bg-gradient-to-br from-blue-200 to-cyan-200'
        : 'bg-gradient-to-br from-blue-500 to-cyan-500';
    } else {
      return isDay
        ? 'bg-gradient-to-br from-blue-200 to-green-200'
        : 'bg-gradient-to-br from-indigo-300 to-blue-300';
    }
  };

  return (
    <div
      className={cx(
        'flex flex-col gap-8 rounded-3xl p-8 max-w-[550px] backdrop-blur-xl shadow-2xl animate-fadeIn',
        getCardStyles(),
      )}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes heatWave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes coolBreeze {
          0% { opacity: 0.8; transform: translateX(-5px); }
          50% { opacity: 1; transform: translateX(5px); }
          100% { opacity: 0.8; transform: translateX(-5px); }
        }
        @keyframes calmFade {
          0% { opacity: 0.9; }
          50% { opacity: 1; }
          100% { opacity: 0.9; }
        }
      `}</style>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-6 items-center">
          <div
            className={cx(
              'size-14 rounded-full shadow-lg transition-transform transform hover:scale-110',
              getIconStyles(),
            )}
            aria-label={
              isHighTemp
                ? 'Hot weather'
                : isLowTemp
                  ? 'Cold weather'
                  : 'Moderate weather'
            }
          />
          <div className="text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
            {n(currentTemp)}
            {weatherAtLocation.current_units.temperature_2m}
          </div>
        </div>
        <div className="text-white text-xl font-semibold drop-shadow-md">
          {`H:${n(currentHigh)}° L:${n(currentLow)}°`}
        </div>
      </div>

      <div className="flex flex-row justify-between">
        {displayTimes.map((time, index) => (
          <div
            key={time}
            className="flex flex-col items-center gap-3 animate-slideUp"
          >
            <div className="text-blue-100 text-sm font-medium">
              {format(new Date(time), 'ha')}
            </div>
            <div
              className={cx(
                'size-10 rounded-full shadow-md transition-transform transform hover:scale-125 hover:rotate-12',
                getHourlyIconStyles(displayTemperatures[index]),
              )}
              aria-label={`Weather at ${format(new Date(time), 'ha')}`}
            />
            <div className="text-white text-lg font-semibold drop-shadow-sm">
              {n(displayTemperatures[index])}
              {weatherAtLocation.hourly_units.temperature_2m}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
