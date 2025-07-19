import { tool } from 'ai';
import { z } from 'zod';

// Function to get coordinates from city name using OpenStreetMap Nominatim API
async function getCoordinatesFromCity(cityName: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}

export const getWeather = tool({
  description: 'Get the current weather at a location. You can provide either coordinates (latitude/longitude) or a city name.',
  inputSchema: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: z.string().optional().describe('Name of the city to get weather for'),
  }).refine(
    (data) => (data.latitude !== undefined && data.longitude !== undefined) || data.city !== undefined,
    {
      message: 'Either provide both latitude and longitude, or provide a city name',
    }
  ),
  execute: async (input) => {
    let latitude: number, longitude: number;
    
    if ('city' in input && input.city) {
      // Get coordinates from city name
      const coords = await getCoordinatesFromCity(input.city);
      if (!coords) {
        throw new Error(`Could not find coordinates for city: ${input.city}`);
      }
      latitude = coords.latitude;
      longitude = coords.longitude;
    } else {
      // Use provided coordinates
      if (input.latitude === undefined || input.longitude === undefined) {
        throw new Error('Either provide both latitude and longitude, or provide a city name');
      }
      latitude = input.latitude;
      longitude = input.longitude;
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
    );

    const weatherData = await response.json();
    return {
      ...weatherData,
      location: 'city' in input ? input.city : `${latitude}, ${longitude}`
    };
  },
});
