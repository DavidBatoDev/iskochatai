import type { NextConfig } from "next";
import path from 'path';
import withPWA from 'next-pwa'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default withPWA({
  ...nextConfig,
  pwa: {
    dest: 'public',  // Where the service worker and manifest will be placed
    register: true,
    skipWaiting: true,
  },
});


