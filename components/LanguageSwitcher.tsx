'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const router = useRouter();
  const [locale, setLocale] = useState(() => {
    // Try to get the locale from the cookie
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^|;) ?next-locale=([^;]*)(;|$)/);
      return match ? decodeURIComponent(match[2]) : 'en';
    }
    return 'en';
  });

  useEffect(() => {
    // When the locale changes, update the cookie and reload the page
    document.cookie = `next-locale=${locale}; path=/; max-age=${60 * 60 * 24 * 30}`;
    // We need to refresh the page to apply the new locale
    // However, note that we are using the App Router and the middleware will handle the locale.
    // We can just replace the URL without the locale prefix and let the middleware add it.
    // But for simplicity, we'll reload the page.
    // Alternatively, we can use the router to push the same path (which will trigger the middleware to add the locale prefix).
    // However, the middleware expects the URL without the locale prefix? Actually, our middleware removes the locale prefix and sets the cookie.
    // So if we are on /en/about and we change to hi, we want to go to /hi/about.
    // We can do:
    const pathname = router.pathname;
    // Remove the current locale prefix if present
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    // Replace the locale in the URL
    router.push(`/${locale}${pathWithoutLocale}`);
  }, [locale, router]);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLocale('en')}
        className={locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-300'}
        disabled={locale === 'en'}
      >
        {t('english')}
      </button>
      <button
        onClick={() => setLocale('hi')}
        className={locale === 'hi' ? 'bg-blue-500 text-white' : 'bg-gray-300'}
        disabled={locale === 'hi'}
      >
        {t('hindi')}
      </button>
    </div>
  );
}