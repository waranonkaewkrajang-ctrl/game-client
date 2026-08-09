import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};