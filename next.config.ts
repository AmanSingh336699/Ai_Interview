import type { NextConfig } from "next";
import { config } from "process";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false }
    return config;
  }
  /* config options here */
};

export default nextConfig;
