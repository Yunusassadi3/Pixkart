import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configured for production deployment on Netlify, Vercel, and Node.js servers
  output: "standalone",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/Tanzar",
        permanent: false,
      },
      {
        source: "/Admin",
        destination: "/Tanzar",
        permanent: false,
      },
      {
        source: "/tanzar",
        destination: "/Tanzar",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
