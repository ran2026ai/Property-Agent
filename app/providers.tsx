'use client';

import { NextIntlClientProvider } from 'next-intl';

interface Props {
  locale: string;
  children: React.ReactNode;
}

export default function Providers({ locale, children }: Props) {
  return (
    <NextIntlClientProvider locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}