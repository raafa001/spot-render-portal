/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://api.spot-render.local',
    NEXT_PUBLIC_AI_API_URL: process.env.NEXT_PUBLIC_AI_API_URL || 'http://api.spot-render.local',
  },
};

module.exports = nextConfig;
