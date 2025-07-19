'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { initializeLocationDetection, type LocationData } from '@/lib/utils/location-service';

interface LocationContextType {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const locationData = await initializeLocationDetection();
      setLocation(locationData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize location detection when component mounts
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, isLoading, error, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

// Location permission request component
export function LocationPermissionBanner() {
  const { location, error, requestLocation, isLoading } = useLocation();
  const [dismissed, setDismissed] = useState(false);

  // Don't show banner if location is already available or user dismissed it
  if (location || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <svg className="size-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Enable Location Access
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get weather for your current location automatically
            </p>
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={requestLocation}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Requesting...' : 'Allow Location'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
