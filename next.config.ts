import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse","pdf-lib","pdf2json"],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/chat',
        permanent: false, // using false for flexibility but immediate
      },
    ]
  }
};

export default nextConfig;
