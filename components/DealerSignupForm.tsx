'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function DealerSignupForm() {
  const t = useTranslations('dealerSignup');
  const router = useRouter();
  const [name, setName] = useState('');
  const [whatsappNumber, setWhatsAppNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!name.trim() || !whatsappNumber.trim()) {
      setError(t('common.error', { defaultValue: 'Please fill in all required fields' }));
      setLoading(false);
      return;
    }

    const cleaned = whatsappNumber.replace(/\s/g, '');
    if (!/^\+?\d{10,15}$/.test(cleaned)) {
      setError(t('dealerSignup.error', { defaultValue: 'Please enter a valid WhatsApp number' }));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/dealer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          whatsappNumber: cleaned,
          businessName: businessName || undefined,
          city: city || undefined,
          area: area || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('common.error', { defaultValue: 'Failed to create dealer account' }));
      }

      setSuccess(true);
      // Optionally, redirect to a success page or the dealer dashboard
      // For now, we just show a success message and keep the form
    } catch (err: any) {
      setError(err.message || t('common.error', { defaultValue: 'An unexpected error occurred' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6">
      <h2 className="text-xl font-bold text-center">{t('dealerSignup.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {t('dealerSignup.name')}
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
            {t('dealerSignup.whatsappNumber')}
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
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium mb-1">
            {t('dealerSignup.businessName')}
          </label>
          <input
            id="businessName"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            {t('dealerSignup.city')}
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="area" className="block text-sm font-medium mb-1">
            {t('dealerSignup.area')}
          </label>
          <input
            id="area"
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 ${
            loading ? 'cursor-not-allowed' : ''
          }`}
        >
          {loading ? t('common.loading', { defaultValue: 'Creating...' }) : t('dealerSignup.submit')}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-sm text-center">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-500 text-sm text-center">
          {t('dealerSignup.success', { defaultValue: 'Dealer account created successfully!' })}
        </p>
      )}
    </div>
  );
}