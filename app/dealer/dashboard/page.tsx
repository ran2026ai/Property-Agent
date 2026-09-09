import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function DealerDashboard() {
  const t = useTranslations('dealerDashboard');
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [mapClicks, setMapClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We'll need to get the dealer's ID from the session or cookie.
  // For now, we'll assume we have a way to get the dealer's ID.
  // We'll get it from a cookie that we set when the dealer logs in.
  // We'll create a helper function to get the dealer's ID from a cookie.

  const getDealerIdFromCookie = () => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^|?)dealer_id=([^;]*)(;|$)/);
      return match ? decodeURIComponent(match[2]) : null;
    }
    return null;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dealerId = getDealerIdFromCookie();
        if (!dealerId) {
          setError(t('dealerDashboard.errorNoDealerId'));
          setLoading(false);
          return;
        }

        // Fetch the dealer's properties
        const propertiesRes = await fetch(`/api/properties?dealerId=${dealerId}&status=ACTIVE,SOLD,RENTED,INACTIVE`);
        if (!propertiesRes.ok) {
          throw new Error('Failed to fetch properties');
        }
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData);

        // Fetch pending access requests for this dealer
        const pendingRes = await fetch(`/api/access-request?dealerId=${dealerId}&status=PENDING`);
        if (!pendingRes.ok) {
          throw new Error('Failed to fetch pending requests');
        }
        const pendingData = await pendingRes.json();
        setPendingRequests(pendingData);

        // Fetch map click events for this dealer's properties
        // We'll need to get all property IDs for this dealer to fetch map clicks.
        // We'll do it in two steps: first get the properties, then fetch map clicks for each property.
        // Alternatively, we can create an API endpoint that gets map clicks for a dealer.
        // For now, we'll fetch map clicks for each property and combine them.
        // But to avoid too many requests, we'll assume we have an API endpoint for dealer map clicks.
        // We'll create it later.
        // For now, we'll leave it empty and implement later.
        setMapClicks([]); // Placeholder
      } catch (err) {
        setError(t('dealerDashboard.errorFetching', { defaultValue: 'Error fetching dashboard data' }));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  const handleAuthorizeRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/access-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'AUTHORIZED' }),
      });
      if (!res.ok) {
        throw new Error('Failed to authorize request');
      }
      // Refetch pending requests
      const dealerId = getDealerIdFromCookie();
      if (dealerId) {
        const pendingRes = await fetch(`/api/access-request?dealerId=${dealerId}&status=PENDING`);
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          setPendingRequests(pendingData);
        }
      }
    } catch (err) {
      console.error('Error authorizing request:', err);
      alert(t('dealerDashboard.errorAuthorizing'));
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/access-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'DECLINED' }),
      });
      if (!res.ok) {
        throw new Error('Failed to decline request');
      }
      // Refetch pending requests
      const dealerId = getDealerIdFromCookie();
      if (dealerId) {
        const pendingRes = await fetch(`/api/access-request?dealerId=${dealerId}&status=PENDING`);
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          setPendingRequests(pendingData);
        }
      }
    } catch (err) {
      console.error('Error declining request:', err);
      alert(t('dealerDashboard.errorDeclining'));
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const dealerId = getDealerIdFromCookie();
      if (!dealerId) {
        throw new Error('Dealer ID not found');
      }
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'x-dealer-id': dealerId, // Pass the dealer ID in the header for authorization
        },
      });
      if (!res.ok) {
        throw new Error('Failed to delete property');
      }
      // Refetch properties
      if (dealerId) {
        const propertiesRes = await fetch(`/api/properties?dealerId=${dealerId}&status=ACTIVE,SOLD,RENTED,INACTIVE`);
        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json();
          setProperties(propertiesData);
        }
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      alert(t('dealerDashboard.errorDeleting'));
    }
  };

  const handleTogglePropertyStatus = async (propertyId: string, currentStatus: string) => {
    try {
      const dealerId = getDealerIdFromCookie();
      if (!dealerId) {
        throw new Error('Dealer ID not found');
      }
      // Determine the new status
      let newStatus: string;
      switch (currentStatus) {
        case 'ACTIVE':
          newStatus = 'INACTIVE';
          break;
        case 'INACTIVE':
          newStatus = 'ACTIVE';
          break;
        case 'SOLD':
          newStatus = 'ACTIVE'; // Or maybe we don't allow toggling from SOLD? We'll allow toggling back to ACTIVE for simplicity.
          break;
        case 'RENTED':
          newStatus = 'ACTIVE';
          break;
        default:
          newStatus = 'ACTIVE';
      }
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error('Failed to update property status');
      }
      // Refetch properties
      if (dealerId) {
        const propertiesRes = await fetch(`/api/properties?dealerId=${dealerId}&status=ACTIVE,SOLD,RENTED,INACTIVE`);
        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json();
          setProperties(propertiesData);
        }
      }
    } catch (err) {
      console.error('Error toggling property status:', err);
      alert(t('dealerDashboard.errorTogglingStatus'));
    }
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
          <h1 className="text-2xl font-bold">{t('dealerDashboard.title')}</h1>
        </div>

        {/* Tabs for Properties, Pending Requests, Map Clicks */}
        {/* We'll implement tabs later. For now, we'll show all sections. */}
        <div className="space-y-8">

          {/* Properties Section */}
          <section>
            <h2 className="text-xl font-bold mb-4">{t('dealerDashboard.myProperties')}</h2>
            {properties.length === 0 ? (
              <p className="text-gray-500">{t('dealerDashboard.noProperties')}</p>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4">
                      <h3 className="text-lg font-bold">{property.address}</h3>
                      <p className="text-gray-600 mt-1">
                        {property.city}, {property.state}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                        <span>
                          {t('dealerDashboard.type')}: {t(`dealerDashboard.type${property.type}`)}
                        </span>
                        <span>
                          {t('dealerDashboard.category')}: {t(`dealerDashboard.category${property.category}`)}
                        </span>
                        <span>
                          {t('dealerDashboard.size')}: {property.sizeSqft} {t('dealerDashboard.sqft')}
                        </span>
                        <span>
                          {t('dealerDashboard.landClassification')}: {t(`dealerDashboard.land${property.landClassification}`)}
                        </span>
                      </div>
                      <p className="mt-2 text-font-semibold">
                        {t('dealerDashboard.approximateValue')} {property.approximateValue}
                      </p>
                    </div>
                    <div className="px-4 pb-4 space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTogglePropertyStatus(property.id, property.status)}
                          className="flex-1 px-3 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300"
                        >
                          {property.status === 'ACTIVE' ? t('dealerDashboard.markInactive') : t('dealerDashboard.markActive')}
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                        >
                          {t('dealerDashboard.delete')}
                        </button>
                      </div>
                      <a
                        href(`/dealer/properties/${property.id}/edit`)
                        className="w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                      >
                        {t('dealerDashboard.edit')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Access Requests Section */}
          <section>
            <h2 className="text-xl font-bold mb-4">{t('dealerDashboard.pendingRequests')}</h2>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500">{t('dealerDashboard.noPendingRequests')}</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-md">
                    <div className="p-4">
                      <p className="font-medium">{t('dealerDashboard.requestFrom')}: {request.name}</p>
                      <p className="text-gray-600">{t('dealerdashboard.whatsappNumber')}: {request.whatsappNumber}</p>
                      {request.propertyId && (
                        <p className="mt-2 text-sm text-gray-500">
                          {t('dealerDashboard.requestForProperty')}:
                          {/* We would need to fetch the property address to show here. For now, we'll show the property ID. */}
                          {request.propertyId}
                        </p>
                      )}
                    </div>
                    <div className="px-4 pb-4 flex space-x-2">
                      <button
                        onClick={() => handleAuthorizeRequest(request.id)}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                      >
                        {t('dealerDashboard.authorize')}
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                        >
                        {t('dealerDashboard.decline')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Map Clicks Section */}
          <section>
            <h2 className="text-xl font-bold mb-4">{t('dealerDashboard.mapClicks')}</h2>
            {mapClicks.length === 0 ? (
              <p className="text-gray-500">{t('dealerDashboard.noMapClicks')}</p>
            ) : (
              <div className="space-y-4">
                {mapClicks.map((click) => (
                  <div key={click.id} className="bg-white rounded-lg shadow-md">
                    <div className="p-4">
                      <p className="font-medium">{t('dealerDashboard.clickedBy')}: {click.user.name}</p>
                      <p className="text-gray-600">{t('dealerdashboard.whatsappNumber')}: {click.user.whatsappNumber}</p>
                      <p className="text-sm text-gray-500">{t('dealerDashboard.clickedAt')}: {new Date(click.clickedAt).toLocaleString()}</p>
                      {click.property && (
                        <p className="mt-2 text-sm text-gray-500">
                          {t('dealerDashboard.clickedOnProperty')}: {click.property.address}
                        </p>
                      )}
                    </div>
                    <div className="px-4 pb-4">
                      <a
                        href={`wa.me/${click.user.whatsappNumber}`}
                        className="w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                      >
                        {t('dealerDashboard.messageOnWhatsApp')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}