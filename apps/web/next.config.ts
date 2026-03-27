import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@sprite-generator/ui",
    "@sprite-generator/shared-types",
    "@sprite-generator/shared-schemas",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
