import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/42-blackhole-calculator',
  assetPrefix: '/42-blackhole-calculator',
  output: 'standalone',
  outputFileTracingRoot: '/app',
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during builds
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://erdelp.com/42-blackhole-calculator',
  },
};

export default nextConfig;