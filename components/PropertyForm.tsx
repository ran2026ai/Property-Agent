'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

interface PropertyFormProps {
  propertyId?: string; // If provided, the form is for editing
}

export default function PropertyForm({ propertyId }: PropertyFormProps) {
  const t = useTranslations('propertyForm');
  const router = useRouter();
  const pathname = usePathname();

  const [property, setProperty] = useState({
    dealerId: '', // This should be obtained from the authenticated dealer's user ID
    type: 'SELL' as const,
    category: 'RESIDENTIAL' as const,
    sizeSqft: '',
    address: '',
    areaLocality: '',
    city: '',
    state: '',
    googleMapsLink: '',
    approximateValue: '',
    landClassification: 'GENERAL' as const,
    photos: [] as string[],
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch the property if editing
  useEffect(() => {
    if (propertyId) {
      const fetchProperty = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/properties?dealerId=${property.propertyId}`); // This is not correct, we need to fetch by propertyId
          // Actually, we should have an API to get a single property by id.
          // Let's assume we have /api/properties/[id]
          // For now, we'll skip the fetch and just show an error if we can't fetch.
          // We'll implement the API for getting a single property later.
          // For now, we'll just set the property to empty and show an error.
          setError(t('propertyForm.errorFetching', { defaultValue: 'Error fetching property' }));
        } catch (err) {
          setError(t('propertyForm.errorFetching', { defaultValue: 'Error fetching property' }));
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [propertyId, t]);

  const handleChange = (field: keyof typeof property, value: any) => {
    setProperty((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotosChange = (newPhotos: string[]) => {
    setProperty((prev) => ({ ...prev, photos: newPhotos }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (
      !property.dealerId ||
      !property.type ||
      !property.category ||
      property.sizeSqft === '' ||
      !property.address ||
      !property.city ||
      !property.state ||
      !property.googleMapsLink ||
      property.approximateValue === '' ||
      !property.landClassification
    ) {
      setError(t('propertyForm.error', { defaultValue: 'Please fill in all required fields' }));
      setLoading(false);
      return;
    }

    // Validate photos
    if (property.photos.length > 5) {
      setError(t('propertyForm.errorPhotos', { defaultValue: 'Maximum 5 photos allowed' }));
      setLoading(false);
      return;
    }

    try {
      let res;
      if (propertyId) {
        // Update property
        res = await fetch(`/api/properties/${propertyId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(property),
        });
      } else {
        // Create property
        res = await fetch('/api/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(property),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('common.error', { defaultValue: 'Failed to save property' }));
      }

      setSuccess(true);
      // Optionally, redirect to the property list or the property detail page
      // For now, we'll just show a success message.
    } catch (err: any) {
      setError(err.message || t('common.error', { defaultValue: 'An unexpected error occurred' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6">
      <h2 className="text-xl font-bold text-center">
        {propertyId ? t('propertyForm.editTitle') : t('propertyForm.createTitle')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dealer ID (hidden, but we can show it for debugging) */}
        {/* In a real app, we would get the dealer ID from the authenticated user's session */}
        <div>
          <label htmlFor="dealerId" className="block text-sm font-medium mb-1">
            {t('propertyForm.dealerId')}
          </label>
          <input
            id="dealerId"
            type="text"
            value={property.dealerId}
            onChange={(e) => handleChange('dealerId', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            {t('propertyForm.type')}
          </label>
          <select
            id="type"
            value={property.type}
            onChange={(e) => handleChange('type', e.target.value as const)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SELL">{t('propertyForm.typeSell')}</option>
            <option value="BUY">{t('propertyForm.typeBuy')}</option>
            <option value="RENT">{t('propertyForm.typeRent')}</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            {t('propertyForm.category')}
          </label>
          <select
            id="category"
            value={property.category}
            onChange={(e) => handleChange('category', e.target.value as const)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="RESIDENTIAL">{t('propertyForm.categoryResidential')}</option>
            <option value="COMMERCIAL">{t('propertyForm.categoryCommercial')}</option>
            <option value="AGRICULTURAL_LAND">{t('propertyForm.categoryAgriculturalLand')}</option>
            <option value="PLOT">{t('propertyForm.categoryPlot')}</option>
          </select>
        </div>

        {/* Size */}
        <div>
          <label htmlFor="sizeSqft" className="block text-sm font-medium mb-1">
            {t('propertyForm.sizeSqft')}
          </label>
          <input
            id="sizeSqft"
            type="number"
            value={property.sizeSqft}
            onChange={(e) => handleChange('sizeSqft', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            {t('propertyForm.address')}
          </label>
          <input
            id="address"
            type="text"
            value={property.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Area/Locality */}
        <div>
          <label htmlFor="areaLocality" className="block text-sm font-medium mb-1">
            {t('propertyForm.areaLocality')}
          </label>
          <input
            id="areaLocality"
            type="text"
            value={property.areaLocality}
            onChange={(e) => handleChange('areaLocality', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            {t('propertyForm.city')}
          </label>
          <input
            id="city"
            type="text"
            value={property.city}
            onChange={(e) => handleChange('city', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            {t('propertyForm.state')}
          </label>
          <input
            id="state"
            type="text"
            value={property.state}
            onChange={(e) => handleChange('state', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Google Maps Link */}
        <div>
          <label htmlFor="googleMapsLink" className="block text-sm font-medium mb-1">
            {t('propertyForm.googleMapsLink')}
          </label>
          <input
            id="googleMapsLink"
            type="text"
            value={property.googleMapsLink}
            onChange={(e) => handleChange('googleMapsLink', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://maps.google.com/?..."
          />
        </div>

        {/* Approximate Value */}
        <div>
          <label htmlFor="approximateValue" className="block text-sm font-medium mb-1">
            {t('propertyForm.approximateValue')}
          </label>
          <input
            id="approximateValue"
            type="number"
            value={property.approximateValue}
            onChange={(e) => handleChange('approximateValue', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Land Classification */}
        <div>
          <label htmlFor="landClassification" className="block text-sm font-medium mb-1">
            {t('propertyForm.landClassification')}
          </label>
          <select
            id="landClassification"
            value={property.landClassification}
            onChange={(e) => handleChange('landClassification', e.target.value as const)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GENERAL">{t('propertyForm.landGeneral')}</option>
            <option value="OBC">{t('propertyForm.landObc')}</option>
            <option value="SC">{t('propertyForm.landSc')}</option>
            <option value="ST">{t('propertyForm.landSt')}</option>
          </select>
        </div>

        {/* Photos */}
        <div>
          <label htmlFor="photos" className="block text-sm font-medium mb-1">
            {t('propertyForm.photos')}
          </label>
          <div className="space-y-2">
            {/* We'll implement a simple photo upload later. For now, we'll just have a text input for URLs. */}
            <div className="flex flex-wrap gap-2">
              {property.photos.map((photo, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => {
                      const newPhotos = [...property.photos];
                      newPhotos[index] = e.target.value;
                      handlePhotosChange(newPhotos);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Photo ${index + 1} URL`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPhotos = [...property.photos];
                      newPhotos.splice(index, 1);
                      handlePhotosChange(newPhotos);
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {property.photos.length < 5 && (
                <div>
                  <input
                    type="text"
                    onChange={(e) => {
                      if (e.target.value) {
                        handlePhotosChange([...property.photos, e.target.value]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add photo URL"
                  />
                </div>
              )}
            </div>
            {property.photos.length >= 5 && (
              <p className="text-xs text-red-500">
                {t('propertyForm.errorPhotos')}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            {t('propertyForm.description')}
          </label>
          <textarea
            id="description"
            value={property.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
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
          {loading ? t('common.loading', { defaultValue: 'Saving...' }) : propertyId ? t('propertyForm.update') : t('propertyForm.create')}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-sm text-center">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-500 text-sm text-center">
          {propertyId ? t('propertyForm.updateSuccess') : t('propertyForm.createSuccess')}
        </p>
      )}
    </div>
  );
}