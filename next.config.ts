import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/42-blackhole-calculator',
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during builds
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://erdelp.com/42-blackhole-calculator',
  },
};

export default nextConfig;