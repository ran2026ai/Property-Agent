import type { NextConfig } from "next";
import { nextIntl } from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Add any Next.js config options here
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'], // Add domains for image sources if needed
  },
};

export default nextIntl(nextConfig);