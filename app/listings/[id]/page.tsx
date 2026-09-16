'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function PropertyDetailPage() {
  const t = useTranslations('propertyDetail');
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();