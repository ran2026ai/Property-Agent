import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const t = useTranslations('adminDashboard');
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We'll need to check if the user is an admin.
  // For now, we'll assume we have a way to get the user's role from the session or cookie.
  // We'll get the user's role from a cookie.

  const getUserRoleFromCookie = () => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^|?)user_role=([^;]*)(;|$)/);
      return match ? decodeURIComponent(match[2]) : null;
    }
    return null;
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userRole = getUserRoleFromCookie();
        if (userRole !== 'ADMIN') {
          setError(t('adminDashboard.errorNotAdmin'));
          setLoading(false);
          return;
        }

        // Fetch all properties
        const propertiesRes = await fetch('/api/properties?status=ACTIVE,SOLD,RENTED,INACTIVE');
        if (!propertiesRes.ok) {
          throw new Error('Failed to fetch properties');
        }
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData);

        // Fetch all users
        const usersRes = await fetch('/api/users'); // We'll need to create this API
        if (!usersRes.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersRes.json();
        setUsers(usersData);

        // Fetch all access requests
        const accessRequestsRes = await fetch('/api/access-request'); // We'll need to create this API to get all requests
        if (!accessRequestsRes.ok) {
          throw new Error('Failed to fetch access requests');
        }
        const accessRequestsData = await accessRequestsRes.json();
        setAccessRequests(accessRequestsData);
      } catch (err) {
        setError(t('adminDashboard.errorFetching', { defaultValue: 'Error fetching admin data' }));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [t]);

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete property');
      }
      // Refetch properties
      const propertiesRes = await fetch('/api/properties?status=ACTIVE,SOLD,RENTED,INACTIVE');
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData);
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      alert(t('adminDashboard.errorDeletingProperty'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // We'll need to create the API for deleting a user
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete user');
      }
      // Refetch users
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(t('adminDashboard.errorDeletingUser'));
    }
  };

  const handleAuthorizeAccessRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/access-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'AUTHORIZED' }),
      });
      if (!res.ok) {
        throw new Error('Failed to authorize access request');
      }
      // Refetch access requests
      const accessRequestsRes = await fetch('/api/access-request');
      if (accessRequestsRes.ok) {
        const accessRequestsData = await accessRequestsRes.json();
        setAccessRequests(accessRequestsData);
      }
    } catch (err) {
      console.error('Error authorizing access request:', err);
      alert(t('adminDashboard.errorAuthorizingRequest'));
    }
  };

  const handleDeclineAccessRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/access-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'DECLINED' }),
      });
      if (!res.ok) {
        throw new Error('Failed to decline access request');
      }
      // Refetch access requests
      const accessRequestsRes = await fetch('/api/access-request');
      if (accessRequestsRes.ok) {
        const accessRequestsData = await accessRequestsRes.json();
        setAccessRequests(accessRequestsData);
      }
    } catch (err) {
      console.error('Error declining access request:', err);
      alert(t('adminDashboard.errorDecliningRequest'));
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
          <h1 className="text-2xl font-bold">{t('adminDashboard.title')}</h1>
        </div>

        {/* Tabs for Properties, Users, Access Requests */}
        {/* We'll implement tabs later. For now, we'll show all sections. */}
        <div className="space-y-8">

          {/* Properties Section */}
          <section>
            <h2 className="text-xl font-bold mb-4">{t('adminDashboard.allProperties')}</h2>
            {properties.length === 0 ? (
              <p className="text-gray-500">{t('adminDashboard.noProperties')}</p>
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
                          {t('adminDashboard.type')}: {t(`adminDashboard.type${property.type}`)}
                        </span>
                        <span>
                          {t('adminDashboard.category')}: {t(`adminDashboard.category${property.category}`)}
                        </span>
                        <span>
                          {t('adminDashboard.size')}: {property.sizeSqft} {t('adminDashboard.sqft')}
                        </span>
                        <span>
                          {t('adminDashboard.landClassification')}: {t(`adminDashboard.land${property.landClassification}`)}
                        </span>
                      </div>
                      <p className="mt-2 text-font-semibold">
                        {t('adminDashboard.approximateValue')} {property.approximateValue}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {t('adminDashboard.dealerName')}: {property.dealer.name}
                      </p>
                    </div>
                    <div className="px-4 pb-4 space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                        >
                          {t('adminDashboard.delete')}
                        </button>
                      </div>
                      <a
                        href(`/dealer/properties/${property.id}/edit`)
                        className="w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                      >
                        {t('adminDashboard.edit')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Users Section */}
          <section>
            <h2 className="text-xl font-bold mb-4">{t('adminDashboard.allUsers')}</h2>
            {users.length === 0 ? (
              <p className="text-gray-500">{t('adminDashboard.noUsers')}</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-white rounded-lg shadow-md">
                    <div className="p-4">
                      <p className="font-medium">{t('adminDashboard.userName')}: {user.name}</p>
                      <p className="text-gray-600">{t('adminDashboard.whatsappNumber')}: {user.whatsappNumber}</p>
                      <p className="text-sm">{t('adminDashboard.role')}: {t(`adminDashboard.role${user.role}`)}</p>
                      <p className="text-sm">{t('adminDashboard.createdAt')}: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="w-full bg-red-500 text-white text-sm py-2 rounded-md hover:bg-red-600"
                      >
                        {t('adminDashboard.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Access Requests Section */}
          <section>
            <h2 className="text-xl font-bold mb-4">{t('adminDashboard.allAccessRequests')}</h2>
            {accessRequests.length === 0 ? (
              <p className="text-gray-500">{t('adminDashboard.noAccessRequests')}</p>
            ) : (
              <div className="space-y-4">
                {accessRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-md">
                    <div className="p-4">
                      <p className="font-medium">{t('adminDashboard.requestFrom')}: {request.user.name}</p>
                      <p className="text-gray-600">{t('adminDashboard.requestForDealer')}: {request.dealer.name}</p>
                      {request.propertyId && (
                        <p className="mt-2 text-sm text-gray-500">
                          {t('adminDashboard.requestForProperty')}: {request.property.address}
                        </p>
                      )}
                      <p className="text-sm">{t('adminDashboard.status')}: {t(`adminDashboard.status${request.status}`)}</p>
                      <p className="text-sm">{t('adminDashboard.createdAt')}: {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="px-4 pb-4 flex space-x-2">
                      <button
                        onClick={() => handleAuthorizeAccessRequest(request.id)}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                      >
                        {t('adminDashboard.authorize')}
                      </button>
                      <button
                        onClick={() => handleDeclineAccessRequest(request.id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                      >
                        {t('adminDashboard.decline')}
                      </button>
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