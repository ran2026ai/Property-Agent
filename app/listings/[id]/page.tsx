import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function PropertyDetailPage() {
  const t = useTranslations('propertyDetail');
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessRequestStatus, setAccessRequestStatus] = useState<'pending' | 'authorized' | 'declined' | null>(null);
  const [userHasAuthorizedAccess, setUserHasAuthorizedAccess] = useState(false);

  // We'll need to get the user's WhatsApp number from cookies or session to check if they have an authorized access request.
  // For now, we'll simulate by checking if there's an access request for this property and the current user (by WhatsApp number) that is authorized.
  // We'll need to get the current user's WhatsApp number from a cookie or from the session.
  // We'll create a helper function to get the user's WhatsApp number from a cookie.

  const getUserWhatsAppNumberFromCookie = () => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^|;) ?user_whatsapp=([^;]*)(;|$)/);
      return match ? decodeURIComponent(match[2]) : null;
    }
    return null;
  };

  useEffect(() => {
    const fetchPropertyAndCheckAccess = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the property
        const propertyRes = await fetch(`/api/properties/${id}`);
        if (!propertyRes.ok) {
          throw new Error('Property not found');
        }
        const propertyData = await propertyRes.json();
        setProperty(propertyData);

        // Check if the user has an authorized access request for this property's dealer
        const userWhatsApp = getUserWhatsAppNumberFromCookie();
        if (userWhatsApp && propertyData) {
          // We need to find the access request for this user and this dealer.
          // We'll call an API to check access request status.
          const accessRes = await fetch(`/api/access-request/status?propertyId=${id}&whatsappNumber=${encodeURIComponent(userWhatsApp)}`);
          if (accessRes.ok) {
            const accessData = await accessRes.json();
            setAccessRequestStatus(accessData.status);
            setUserHasAuthorizedAccess(accessData.status === 'AUTHORIZED');
          } else {
            // If the API fails, we'll assume no access request.
            setAccessRequestStatus(null);
            setUserHasAuthorizedAccess(false);
          }
        }
      } catch (err) {
        setError(t('propertyDetail.errorFetching', { defaultValue: 'Error fetching property details' }));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyAndCheckAccess();
  }, [id, t, searchParams]);

  const handleRequestAccess = async () => {
    if (!property) return;

    // We'll need to get the user's name and WhatsApp number from cookies or a form.
    // For now, we'll prompt the user to enter their name and WhatsApp number in a modal or we'll redirect to the access request page with the dealerId and propertyId.
    // We'll redirect to the access request page with the dealerId and propertyId as query parameters.
    router.push(`/access-request?dealerId=${property.dealerId}&propertyId=${property.id}`);
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!property) {
    return <p className="text-center">{t('propertyDetail.notFound')}</p>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{property.address}</h1>
          <p className="text-gray-600 mb-4">
            {property.city}, {property.state}
          </p>
        </div>

        {/* Photos Gallery */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{t('propertyDetail.photos')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {property.photos && property.photos.length > 0 ? (
              property.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Property photo ${index + 1}`}
                  className="h-64 w-full object-cover rounded-lg"
                />
              ))
            ) : (
              <p className="text-center text-gray-400 h-64 w-full flex items-center justify-center rounded border">
                {t('propertyDetail.noPhotos')}
              </p>
            )}
          </div>
        </div>

        {/* Property Details */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{t('propertyDetail.details')}</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">{t('propertyDetail.type')}</span>
              <span>{t(`propertyDetail.type${property.type}`)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('propertyDetail.category')}</span>
              <span>{t(`propertyDetail.category${property.category}`)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('propertyDetail.size')}</span>
              <span>{property.sizeSqft} {t('propertyDetail.sqft')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('propertyDetail.landClassification')}</span>
              <span>{t(`propertyDetail.land${property.landClassification}`)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('propertyDetail.approximateValue')}</span>
              <span>{property.approximateValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('propertyDetail.status')}</span>
              <span>{t(`propertyDetail.status${property.status}`)}</span>
            </div>
            {property.description && (
              <div className="mt-2">
                <span className="font-medium">{t('propertyDetail.description')}</span>
                <p className="mt-1 line-clamp-3 text-gray-600">{property.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Google Maps Link */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{t('propertyDetail.googleMaps')}</h2>
          <div className="flex items-center space-x-4">
            <a
              href={property.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span>{t('propertyDetail.viewOnMap')}</span>
            </a>
            {/* We will track map clicks only for users with authorized access */}
            {userHasAuthorizedAccess && (
              <button
                onClick={() => {
                  // We'll send a request to log the map click
                  fetch(`/api/map-click`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      propertyId: property.id,
                      // We need to get the user ID from the cookie or session.
                      // We'll get it from the access request or from the user's WhatsApp number.
                      // For now, we'll skip the user ID and just log the property ID and timestamp.
                      // We'll need to get the user ID from the access request.
                      // We'll assume we have a way to get the user ID from the WhatsApp number.
                      // We'll leave it blank for now and implement later.
                    }),
                  });
                }}
                className="text-xs text-blue-500 hover:underline"
              >
                {t('propertyDetail.trackMapClick')}
              </button>
            )}
          </div>
        </div>

        {/* Dealer Contact Info */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{t('propertyDetail.dealerContact')}</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">{t('propertyDetail.dealerName')}</span>
              <span>{property.dealer.name}</span>
            </div>
            {property.dealer.dealerProfile && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">{t('propertyDetail.businessName')}</span>
                  <span>{property.dealer.dealerProfile.businessName || t('propertyDetail.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t('propertyDetail.dealerCity')}</span>
                  <span>{property.dealer.dealerProfile.city || t('propertyDetail.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t('propertyDetail.dealerArea')}</span>
                  <span>{property.dealer.dealerProfile.area || t('propertyDetail.notAvailable')}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="font-medium">{t('propertyDetail.whatsappNumber')}</span>
              <span className="{userHasAuthorizedAccess ? 'font-medium' : 'text-gray-400'}">
                {userHasAuthorizedAccess ? property.dealer.whatsappNumber : t('propertyDetail.contactAfterAuthorization')}
              </span>
            </div>
          </div>
          {!userHasAuthorizedAccess && (
            <div className="mt-4">
              <button
                onClick={handleRequestAccess}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                {t('propertyDetail.requestAccess')}
              </button>
            </div>
          )}
        </div>

        {/* Map Click Tracking Section (for dealers) */}
        {/* We'll add this in the dealer dashboard */}
      </div>
    </div>
  );
}