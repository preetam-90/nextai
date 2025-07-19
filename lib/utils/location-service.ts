'use client';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  accuracy?: number;
}

export interface LocationService {
  getCurrentLocation(): Promise<LocationData>;
  getLocationFromIP(): Promise<LocationData>;
  requestLocationPermission(): Promise<boolean>;
}

// Get location using browser's Geolocation API
export async function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Try to get city name from coordinates
        const cityInfo = await getCityFromCoordinates(latitude, longitude);
        
        resolve({
          latitude,
          longitude,
          accuracy,
          city: cityInfo?.city,
          country: cityInfo?.country,
        });
      },
      (error) => {
        let message = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Get location from IP address (fallback method)
export async function getLocationFromIP(): Promise<LocationData> {
  try {
    // Using ipapi.co as a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.reason || 'IP geolocation failed');
    }
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      country: data.country_name,
    };
  } catch (error) {
    console.error('IP geolocation failed:', error);
    throw new Error('Unable to get location from IP');
  }
}

// Get city name from coordinates using reverse geocoding
async function getCityFromCoordinates(latitude: number, longitude: number): Promise<{ city: string; country: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`
    );
    const data = await response.json();
    
    if (data && data.address) {
      return {
        city: data.address.city || data.address.town || data.address.village || data.address.hamlet || 'Unknown',
        country: data.address.country || 'Unknown'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

// Request location permission
export async function requestLocationPermission(): Promise<boolean> {
  if (!navigator.permissions) {
    // Fallback: try to get location directly
    try {
      await getCurrentLocation();
      return true;
    } catch {
      return false;
    }
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state === 'granted';
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

// Combined location service that tries multiple methods
export async function getBestAvailableLocation(): Promise<LocationData> {
  try {
    // First try GPS/browser geolocation
    return await getCurrentLocation();
  } catch (gpsError) {
    console.log('GPS location failed, trying IP geolocation:', gpsError);
    
    try {
      // Fallback to IP geolocation
      return await getLocationFromIP();
    } catch (ipError) {
      console.error('All location methods failed:', ipError);
      throw new Error('Unable to determine location. Please allow location access or specify a city name.');
    }
  }
}

// Auto-detect user's location on page load
export function initializeLocationDetection(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    // Try to get location without blocking the UI
    getBestAvailableLocation()
      .then(resolve)
      .catch((error) => {
        console.log('Location detection failed:', error);
        resolve(null);
      });
  });
}
