import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // S3 bucket hosting uploaded cover images.
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        // Favicon service used to derive an icon from an entity's website.
        protocol: "https",
        hostname: "www.google.com",
      },
    ],
  },
};

export default nextConfig;
