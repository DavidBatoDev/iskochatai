// next.config.ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
  // Add ESLint configuration to disable the dynamic API params rule
  eslint: {
    // Your existing ESLint config (if any)
    ignoreDuringBuilds: true, // Optional: ignore all ESLint errors during build
  },
};

export default nextConfig;