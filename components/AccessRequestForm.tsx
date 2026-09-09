'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AccessRequestForm({
  dealerId,
  propertyId
}: {
  dealerId?: string;
  propertyId?: string;
}) {
  const t = useTranslations('accessRequest');
  const router = useRouter();
  const searchParams = useSearchParams();
  // Override props with query params if present (for fallback)
  const effectiveDealerId = dealerId ?? searchParams.get('dealerId');
  const effectivePropertyId = propertyId ?? searchParams.get('propertyId');

  const [name, setName] = useState('');
  const [whatsappNumber, setWhatsAppNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!name.trim() || !whatsappNumber.trim()) {
      setError(t('common.error', { defaultValue: 'Please fill in all fields' }));
      setLoading(false);
      return;
    }

    const cleaned = whatsappNumber.replace(/\s/g, '');
    if (!/^\+?\d{10,15}$/.test(cleaned)) {
      setError(t('accessRequest.error', { defaultValue: 'Please enter a valid WhatsApp number' }));
      setLoading(false);
      return;
    }

    if (!effectiveDealerId) {
      setError(t('accessRequest.error', { defaultValue: 'Dealer ID is required' }));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          whatsappNumber: cleaned,
          dealerId: effectiveDealerId,
          propertyId: effectivePropertyId ?? undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('common.error', { defaultValue: 'Failed to submit request' }));
      }

      setSuccess(true);
      setName('');
      setWhatsAppNumber('');
    } catch (err: any) {
      setError(err.message || t('common.error', { defaultValue: 'An unexpected error occurred' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6">
      <h2 className="text-xl font-bold text-center">{t('accessRequest.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {t('accessRequest.name')}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="whatsappNumber" className="block text-sm font-medium mb-1">
            {t('accessRequest.whatsappNumber')}
          </label>
          <input
            id="whatsappNumber"
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsAppNumber(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1234567890"
          />
        </div>
        {/* Hidden fields for dealerId and propertyId if we want to show them for debugging */}
        {/*
        {effectiveDealerId && (
          <div>
            <label htmlFor="dealerId" className="block text-sm font-medium mb-1">
              Dealer ID
            </label>
            <input
              id="dealerId"
              type="text"
              value={effectiveDealerId}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        )}
        {effectivePropertyId && (
          <div>
            <label htmlFor="propertyId" className="block text-sm font-medium mb-1">
              Property ID
            </label>
            <input
              id="propertyId"
              type="text"
              value={effectivePropertyId}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        )}
         */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 ${
            loading ? 'cursor-not-allowed' : ''
          }`}
        >
          {loading ? t('common.loading', { defaultValue: 'Submitting...' }) : t('accessRequest.submit')}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-sm text-center">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-500 text-sm text-center">
          {t('accessRequest.pending')}
        </p>
      )}
    </div>
  );
}