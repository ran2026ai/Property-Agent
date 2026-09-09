import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ListingsPage() {
  const t = useTranslations('listings');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    landClassification: '',
    status: 'ACTIVE', // Only show active properties by default
  });
  const [sort, setSort] = useState<{ key: 'latest' | 'value'; direction: 'asc' | 'desc' }>({
    key: 'latest',
    direction: 'desc',
  });

  // Initialize filters from search params
  useEffect(() => {
    const params: any = {};
    for (const [key, value] of searchParams.entries()) {
      if (key) {
        params[key] = value;
      }
    }
    setFilters(params);
    // Set sort based on sort parameter
    const sortParam = searchParams.get('sort');
    if (sortParam === 'value_asc') {
      setSort({ key: 'value', direction: 'asc' });
    } else if (sortParam === 'value_desc') {
      setSort({ key: 'value', direction: 'desc' });
    } else {
      setSort({ key: 'latest', direction: 'desc' });
    }
  }, [searchParams]);

  // Fetch properties when filters or sort change
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        // Add filters
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.city) queryParams.append('city', filters.city);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.minSize) queryParams.append('minSize', filters.minSize);
        if (filters.maxSize) queryParams.append('maxSize', filters.maxSize);
        if (filters.landClassification) queryParams.append('landClassification', filters.landClassification);
        if (filters.status) queryParams.append('status', filters.status);
        // Add sort
        if (sort.key === 'latest') {
          // We'll sort by createdAt in the API, but we don't have a parameter for that in our GET endpoint.
          // We'll adjust the API later to support sorting by createdAt.
          // For now, we'll just fetch and sort on the client.
          queryParams.append('sortBy', 'createdAt');
          queryParams.append('sortOrder', sort.direction);
        } else if (sort.key === 'value') {
          queryParams.append('sortBy', 'approximateValue');
          queryParams.append('sortOrder', sort.direction);
        }

        const res = await fetch(`/api/properties?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        setError(t('listings.errorFetching', { defaultValue: 'Error fetching listings' }));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters, sort, t, searchParams]);

  // Handle filter change
  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    // Update the URL to reflect the filter
    const params = new URLSearchParams(searchParams);
    params.set(field, value);
    router.push(`/listings?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (key: 'latest' | 'value', direction: 'asc' | 'desc') => {
    setSort({ key, direction });
    // Update the URL to reflect the sort
    const params = new URLSearchParams(searchParams);
    if (key === 'latest') {
      params.delete('sort'); // Remove sort param for latest (default)
    } else {
      params.set('sort', `${key}_${direction}`);
    }
    router.push(`/listings?${params.toString()}`);
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('listings.title')}</h1>
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.filterType')}</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('listings.allTypes')}</option>
              <option value="SELL">{t('listings.typeSell')}</option>
              <option value="BUY">{t('listings.typeBuy')}</option>
              <option value="RENT">{t('listings.typeRent')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.filterCategory')}</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('listings.allCategories')}</option>
              <option value="RESIDENTIAL">{t('listings.categoryResidential')}</option>
              <option value="COMMERCIAL">{t('listings.categoryCommercial')}</option>
              <option value="AGRICULTURAL_LAND">{t('listings.categoryAgriculturalLand')}</option>
              <option value="PLOT">{t('listings.categoryPlot')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.filterCity')}</label>
            <input
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('listings.filterCityPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.sort')}</label>
            <select
              value={sort.key === 'latest' ? 'latest' : sort.key === 'value' && sort.direction === 'asc' ? 'value_asc' : 'value_desc'}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'latest') {
                  handleSortChange('latest', 'asc');
                } else if (value === 'value_asc') {
                  handleSortChange('value', 'asc');
                } else if (value === 'value_desc') {
                  handleSortChange('value', 'desc');
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="latest">{t('listings.sortLatest')}</option>
              <option value="value_asc">{t('listings.sortValueAsc')}</option>
              <option value="value_desc">{t('listings.sortValueDesc')}</option>
            </select>
          </div>
        </div>

        {/* Price and Size Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.filterMinPrice')}</label>
            <input
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.filterMaxPrice')}</label>
            <input
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.filterMinSize')}</label>
            <input
              value={filters.minSize}
              onChange={(e) => handleFilterChange('minSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.filterMaxSize')}</label>
            <input
              value={filters.maxSize}
              onChange={(e) => handleFilterChange('maxSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10000"
            />
          </div>
        </div>

        {/* Land Classification and Status Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.filterLandClassification')}</label>
            <select
              value={filters.landClassification}
              onChange={(e) => handleFilterChange('landClassification', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('listings.allLandClassifications')}</option>
              <option value="GENERAL">{t('listings.landGeneral')}</option>
              <option value="OBC">{t('listings.landObc')}</option>
              <option value="SC">{t('listings.landSc')}</option>
              <option value="ST">{t('listings.landSt')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('listings.filterStatus')}</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">{t('listings.statusActive')}</option>
              <option value="SOLD">{t('listings.statusSold')}</option>
              <option value="RENTED">{t('listings.statusRented')}</option>
              <option value="INACTIVE">{t('listings.statusInactive')}</option>
            </select>
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-6">
          {properties.length === 0 ? (
            <p className="text-center text-gray-500">{t('listings.noProperties')}</p>
          ) : (
            <>
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <h2 className="text-xl font-bold">{property.address}</h2>
                    <p className="text-gray-600 mt-1">
                      {property.city}, {property.state}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                      <span>
                        {t('listings.type')}: {t(`listings.type${property.type}`)}
                      </span>
                      <span>
                        {t('listings.category')}: {t(`listings.category${property.category}`)}
                      </span>
                      <span>
                        {t('listings.size')}: {property.sizeSqft} {t('listings.sqft')}
                      </span>
                      <span>
                        {t('listings.landClassification')}: {t(`listings.land${property.landClassification}`)}
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-semibold">
                      {t('listings.approximateValue')} {property.approximateValue}
                    </p>
                    <div className="mt-2">
                      {property.photos && property.photos.length > 0 ? (
                        <div className="flex space-x-2">
                          {property.photos.slice(0, 3).map((photo, index) => (
                                            <img
                                            key={index}
                                            src={photo}
                                            alt={`Property photo ${index + 1}`}
                                            className="h-16 w-16 object-cover rounded"
                                          />
                                        ))}
                          {property.photos.length > 3 && (
                            <span className="flex items-center justify-center h-16 w-16 bg-gray-200 rounded text-sm">
                              +{property.photos.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-gray-400 h-16 w-16 flex items-center justify-center rounded border">
                          {t('listings.noPhotos')}
                        </p>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-gray-600">
                      {property.description || t('listings.noDescription')}
                    </p>
                  </div>
                  <div className="px-4 pb-4">
                    <a
                      href(`/listings/${property.id}`)
                      className="w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                    >
                      {t('listings.viewDetails')}
                    </a>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}