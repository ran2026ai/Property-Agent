import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Add any Next.js config options here
  reactStrictMode: true,
  images: {
    domains: ['xolmjsdujcmrvxatxozw.supabase.co'],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);