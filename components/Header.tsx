'use client';

import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <header className="bg-white border-b md:flex md:items-center md:justify-between px-4 py-3 shadow-sm">
      <div className="flex flex-col items-start md:flex-row md:items-center md:justify-start md:w-0 md:flex-1">
        <Link href="/" className="-mr-1 flex items-center mb-2 md:mb-0 md:space-x-2 rtl:space-x-reverse">
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Warm Rain</span>
        </Link>
        <nav className="md:ml-6 md:mt-0 mt-4 flex flex-wrap items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <Link
            href="/listings"
            className={pathname === '/listings' ? 'border-b-2 border-blue-500 pb-1' : 'hover:border-b-2 hover:border-gray-300 hover:pb-1 px-3 py-2 rounded-md'}
          >
            {t('navbar.listings')}
          </Link>
          <Link
            href="/dealer/dashboard"
            className={pathname.startsWith('/dealer') ? 'border-b-2 border-blue-500 pb-1' : 'hover:border-b-2 hover:border-gray-300 hover:pb-1 px-3 py-2 rounded-md'}
          >
            {t('navbar.dealerDashboard')}
          </Link>
          <Link
            href="/admin/dashboard"
            className={pathname.startsWith('/admin') ? 'border-b-2 border-blue-500 pb-1' : 'hover:border-b-2 hover:border-gray-300 hover:pb-1 px-3 py-2 rounded-md'}
          >
            {t('navbar.adminDashboard')}
          </Link>
        </nav>
      </div>
      <div className="flex flex-col items-end md:flex-row md:items-center md:justify-end md:w-0 md:flex-1">
        <div className="flex items-center mb-2 md:mb-0">
          {/* We assume the user is not authenticated for now; we'll add auth later */}
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            {t('navbar.login')}
          </Link>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}