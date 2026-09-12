import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configured for production deployment on Netlify, Vercel, and Node.js servers
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
