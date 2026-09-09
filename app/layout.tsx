import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getRequestConfig } from 'next-intl/server';
import Providers from './providers';
import Header from '@/components/Header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Property Dealer",
  description: "A bilingual web application for property dealers",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getRequestConfig();

  return (
    <html lang={locale}>
      <body className="min-h-full flex flex-col">
        <Providers locale={locale}>
          <Header />
          <main className="flex flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}