import path from 'path';
import type { NextConfig } from 'next';

/** @type {NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qhjrkwnemtwltztbqcrc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
<<<<<<< HEAD
  webpack: (config) => {
    // Habilita o alias "@/"
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
=======
  experimental: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1748881505468.cluster-etsqrqvqyvd4erxx7qq32imrjk.cloudworkstations.dev',
    ],
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
  },
};

export default nextConfig;
