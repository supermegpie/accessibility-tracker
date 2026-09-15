import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { useBusinesses, Business } from '../hooks/useBusinesses';
import { ReviewForm } from './ReviewForm';
import { BusinessDetail } from './BusinessDetail';
import { AccessibilityFilter, FilterState } from './AccessibilityFilter';
import { NearbyReviews } from './NearbyReviews';

const CHICAGO_CENTER = { lat: 41.8781, lng: -87.6298 };

interface PlaceDbData {
  overall_accessibility_score?: number;
  mobility_accessibility_score?: number;
  vision_accessibility_score?: number;
  hearing_accessibility_score?: number;
  sensory_accessibility_score?: number;
  google_rating?: number;
  google_wheelchair_accessible?: boolean;
  auto_scored?: boolean;
}

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  types?: string[];
  db_data?: PlaceDbData | null;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface MapViewProps {
  onCitySearch?: (city: string) => void;
}

interface UserProfile {
  disability_categories?: string[];
  identifies_as_disabled?: boolean;
  is_caregiver?: boolean;
}

export function MapView({ onCitySearch, userProfile }: MapViewProps & { userProfile?: UserProfile }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [mapCenter, setMapCenter] = useState(CHICAGO_CENTER);
  const [searchInput, setSearchInput] = useState('');
  const [businessQuery, setBusinessQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBusinessDetail, setShowBusinessDetail] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ minScore: 0, category: 'all', businessType: 'all' });
  const { businesses, refetch } = useBusinesses(filters.minScore, filters.businessType, filters.category);
  const [mapZoom, setMapZoom] = useState(13);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapKey, setMapKey] = useState(0);

  /* Search for places using Google Places API */
  // Center map on user's current location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setMapCenter(loc);
          setUserLocation(loc);
          setMapKey(prev => prev + 1);
        },
        () => {
          // If user denies location, keep default Chicago center
          console.log('Location access denied, using default center');
        }
      );
    }
  }, []);

  const searchPlaces = async () => {
    if (!searchInput && !businessQuery) return;
    if (!searchInput && businessQuery && !userLocation) {
      alert('Please enter a city or neighborhood, or allow location access so we can search near you.');
      return;
    }
    setLoading(true);
    try {
      const locationParam = searchInput
        ? encodeURIComponent(searchInput)
        : userLocation
        ? `${userLocation.lat},${userLocation.lng}`
        : 'Chicago,IL';

      const response = await fetch(
        (import.meta.env.VITE_API_URL || '') + `/api/places/search?location=${locationParam}&type=restaurant${businessQuery ? '&query=' + encodeURIComponent(businessQuery) : ''}`
      );
      const data = await response.json();
      if (!data.places || !data.center) {
        console.error('Invalid response from places API:', data);
        setLoading(false);
        return;
      }
      setPlaces(data.places);
      setMapCenter(data.center);
      if (onCitySearch) onCitySearch(searchInput);
      setMapZoom(businessQuery ? 15 : 13);
      setMapKey(prev => prev + 1);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const saveBusiness = async (place: Place) => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_place_id: place.place_id,
          name: place.name,
          address: place.vicinity,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          business_type: place.types?.[0] || 'establishment'
        })
      });
      const data = await response.json();
      await refetch();
      return data.business;
    } catch (error) {
      console.error('Save failed:', error);
      return null;
    }
  };

  /* Determine marker color based on accessibility score */
  const getPlaceMarkerColor = (place: Place) => {
    if (!place.db_data) return { background: '#00ACC1', border: '#006978' }; // not in database
    const db = place.db_data;
    const score = db.overall_accessibility_score ?? db.google_rating ?? null;
    if (score === null) return { background: '#00ACC1', border: '#006978' };
    if (score === 0) return { background: '#7B0000', border: '#4A0000' };
    if (score >= 4) return { background: '#2E7D32', border: '#1A7A40' };
    if (score >= 3) return { background: '#E65100', border: '#B7770D' };
    if (score >= 1) return { background: '#B71C1C', border: '#A93226' };
    return { background: '#00ACC1', border: '#006978' };
  };

  const getMarkerColor = (business: Business) => {
    // Use category score if exists, then overall, then google_rating as fallback
    const categoryScore =
      filters.category === 'mobility' ? business.mobility_accessibility_score :
      filters.category === 'vision'   ? business.vision_accessibility_score :
      filters.category === 'hearing'  ? business.hearing_accessibility_score :
      filters.category === 'sensory'  ? business.sensory_accessibility_score :
      business.overall_accessibility_score;

    const score = categoryScore ?? business.google_rating ?? null;

    if (score === null || score === undefined) return { background: '#00ACC1', border: '#006978' };
    if (score === 0) return { background: '#7B0000', border: '#4A0000' };
    if (score >= 4) return { background: '#2E7D32', border: '#1A7A40' };
    if (score >= 3) return { background: '#E65100', border: '#B7770D' };
    if (score >= 1) return { background: '#B71C1C', border: '#A93226' };
    return { background: '#7B0000', border: '#4A0000' };
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      {/* Nearby reviews sidebar for desktop only */}
      <div style={{ display: 'none' }} className="nearby-sidebar">
        <NearbyReviews
          center={mapCenter}
          onBusinessClick={(b: any) => {
            setMapCenter({ lat: Number(b.latitude), lng: Number(b.longitude) });
            setMapKey(prev => prev + 1);
            setSelectedBusiness(b);
            setSelectedPlace(null);
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
      <AccessibilityFilter filters={filters} onChange={setFilters} />
      <div style={{
        marginBottom: '10px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Enter a city or neighborhood"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onFocus={() => { setSelectedPlace(null); setSelectedBusiness(null); }}
          onKeyDown={e => e.key === 'Enter' && searchPlaces()}
          style={{
            padding: '10px',
            flex: '1',
            minWidth: '200px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
        <input
          type="text"
          placeholder="Search for a specific business (optional)"
          value={businessQuery}
          onChange={e => setBusinessQuery(e.target.value)}
          onFocus={() => { setSelectedPlace(null); setSelectedBusiness(null); }}
          onKeyDown={e => e.key === 'Enter' && searchPlaces()}
          style={{
            padding: '10px',
            flex: '1',
            minWidth: '200px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
        {businessQuery && !searchInput && (
          <span style={{ fontSize: '12px', color: '#E65100', whiteSpace: 'nowrap' }}>
            {userLocation ? 'Searching near your location' : 'Enter a city too for best results'}
          </span>
        )}
        <button
          onClick={searchPlaces}
          style={{
            padding: '10px 20px',
            backgroundColor: '#00ACC1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            whiteSpace: 'nowrap'
          }}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <span style={{ fontSize: '13px', color: '#666', whiteSpace: 'nowrap' }}>
          {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} tracked
        </span>
      </div>

      {/* Search result markers: red */}

      <div style={{ marginBottom: '8px', fontSize: '13px', color: '#666', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00ACC1', display: 'inline-block' }} />
          Blue = search results / not yet reviewed
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2E7D32', display: 'inline-block' }} />
          Green = good access (4-5)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E65100', display: 'inline-block' }} />
          Orange = fair access (3)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#B71C1C', display: 'inline-block' }} />
          Red = poor access (1-2)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7B0000', display: 'inline-block' }} />
          Dark red = cannot enter (0)
        </span>
      </div>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          key={mapKey}
          style={{ width: '100%', height: 'calc(100vh - 200px)', minHeight: '400px' }}
          defaultCenter={mapCenter}
          defaultZoom={mapZoom}
          mapId="accessibility-tracker-map"
        >
          {/* Search result markers. Colored by score if in database, filtered if filter active */}
          {places.filter(place => {
            if (filters.minScore === 0) return true; // no filter — show all
            if (!place.db_data) return false; // filter active — hide unscored
            const score = place.db_data.overall_accessibility_score ?? place.db_data.google_rating ?? null;
            return score !== null && score >= filters.minScore;
          }).map(place => (
            <AdvancedMarker
              key={place.place_id}
              position={place.geometry.location}
              onClick={() => { setSelectedPlace(place); setSelectedBusiness(null); }}
            >
              <Pin background={getPlaceMarkerColor(place).background} borderColor={getPlaceMarkerColor(place).border} glyphColor="white" />
            </AdvancedMarker>
          ))}

          {/* Saved business markers. Color coded by score */}
          {!businessQuery && businesses.map(business => {
            const colors = getMarkerColor(business);
            return (
              <AdvancedMarker
                key={business.google_place_id}
                position={{ lat: Number(business.latitude), lng: Number(business.longitude) }}
                onClick={() => { setSelectedBusiness(business); setSelectedPlace(null); }}
              >
                <Pin
                  background={colors.background}
                  borderColor={colors.border}
                  glyphColor="white"
                />
              </AdvancedMarker>
            );
          })}

          {/* Search result popup */}
          {selectedPlace && (
            <InfoWindow
              position={selectedPlace.geometry.location}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 4px' }}>{selectedPlace.name}</h3>
                <p style={{ margin: '0 0 4px' }}>{selectedPlace.vicinity}</p>
                {selectedPlace.rating && (
                  <p style={{ margin: '0 0 8px' }}>{selectedPlace.rating} stars</p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={async () => { const saved = await saveBusiness(selectedPlace); if (saved) { setSelectedBusiness(saved); setShowBusinessDetail(true); } }}
                    style={{ padding: '6px 12px', backgroundColor: '#00ACC1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={async () => { const saved = await saveBusiness(selectedPlace); if (saved) { setSelectedBusiness(saved); setShowReviewForm(true); } }}
                    style={{ padding: '6px 12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Rate & Review
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Saved business popup */}
          {selectedBusiness && (
            <InfoWindow
              position={{ lat: Number(selectedBusiness.latitude), lng: Number(selectedBusiness.longitude) }}
              onCloseClick={() => setSelectedBusiness(null)}
            >
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 4px' }}>{selectedBusiness.name}</h3>
                <p style={{ margin: '0 0 4px' }}>{selectedBusiness.address}</p>
                <p style={{ margin: '0 0 8px', color: '#00ACC1', fontWeight: 'bold' }}>Saved to Tracker</p>
                {selectedBusiness.overall_accessibility_score && (
                  <p style={{ margin: '0 0 8px' }}>Score: {Number(selectedBusiness.overall_accessibility_score).toFixed(1)}/5</p>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowBusinessDetail(true)}
                    style={{ padding: '6px 12px', backgroundColor: '#00ACC1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    style={{ padding: '6px 12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Rate & Review
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
      {showReviewForm && selectedBusiness && (
        <ReviewForm
          businessId={selectedBusiness.id}
          businessName={selectedBusiness.name}
          onClose={() => setShowReviewForm(false)}
          onSubmitted={() => { refetch(); setSelectedBusiness(null); }}
          userProfile={userProfile}
        />
      )}

      {showBusinessDetail && selectedBusiness && (
        <BusinessDetail
          business={selectedBusiness}
          onClose={() => setShowBusinessDetail(false)}
          onRateClick={() => { setShowBusinessDetail(false); setShowReviewForm(true); }}
        />
      )}
      </div>
    </div>
  );
}
