import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This wildcard allows images from ANY secure website
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
