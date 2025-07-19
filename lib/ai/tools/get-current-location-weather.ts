import { tool } from 'ai';
import { z } from 'zod';

export const getCurrentLocationWeather = tool({
  description: 'Get the current weather for the user\'s current location. This tool automatically detects the user\'s location.',
  inputSchema: z.object({
    useCurrentLocation: z.boolean().default(true).describe('Whether to use the user\'s current location'),
  }),
  execute: async ({ useCurrentLocation }) => {
    if (!useCurrentLocation) {
      throw new Error('Current location weather requires location access');
    }

    // This tool would typically get the user's location from the client-side
    // For now, we'll return a placeholder response that indicates location detection is needed
    return {
      requiresLocationDetection: true,
      message: 'To get weather for your current location, please allow location access in your browser.',
    };
  },
});
