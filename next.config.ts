import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disabling experimental features that might cause issues
  experimental: {
    // ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
