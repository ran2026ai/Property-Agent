import { NextIntlConfig } from "next-intl";

export const i18n: NextIntlConfig = {
  locales: ["en", "hi"],
  defaultLocale: "en",
  localeDetection: false, // We'll use a cookie or user preference
};