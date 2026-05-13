import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { useBusinesses, Business } from '../hooks/useBusinesses';
import { ReviewForm } from './ReviewForm';
import { BusinessDetail } from './BusinessDetail';
import { AccessibilityFilter, FilterState } from './AccessibilityFilter';

const CHICAGO_CENTER = { lat: 41.8781, lng: -87.6298 };

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  types?: string[];
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

export function MapView({ onCitySearch }: MapViewProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [mapCenter, setMapCenter] = useState(CHICAGO_CENTER);
  const [searchInput, setSearchInput] = useState('');
  const [businessQuery, setBusinessQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBusinessDetail, setShowBusinessDetail] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ minScore: 0, category: 'all', businessType: 'all' });
  const { businesses, refetch } = useBusinesses(filters.minScore, filters.businessType);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapKey, setMapKey] = useState(0);

  /* Search for places using Google Places API */
  const searchPlaces = async () => {
    if (!searchInput) return;
    setLoading(true);
    try {
      const response = await fetch(
        (import.meta.env.VITE_API_URL || '') + `/api/places/search?location=${encodeURIComponent(searchInput)}&type=restaurant${businessQuery ? '&query=' + encodeURIComponent(businessQuery) : ''}`
      );
      const data = await response.json();
      setPlaces(data.places);
      setMapCenter(data.center);

      if (onCitySearch) onCitySearch(searchInput);
      // Zoom in more for specific business searches, less for city searches
      setMapZoom(businessQuery ? 15 : 13);
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
      setSaveMessage(data.message);
      refetch();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  /* Determine marker color based on accessibility score */
  const getMarkerColor = (score: number | null) => {
    if (!score) return { background: '#00ACC1', border: '#006978' }; // Blue = not rated
    if (score >= 4) return { background: '#2E7D32', border: '#1A7A40' }; // Green = highly accessible
    if (score >= 3) return { background: '#E65100', border: '#B7770D' }; // Yellow = fair
    return { background: '#B71C1C', border: '#A93226' }; // Red = not accessible
  };

  return (
    <div>
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
      {saveMessage && (
        <p style={{ color: 'green', marginBottom: '10px' }}>{saveMessage}</p>
      )}
      <div style={{ marginBottom: '8px', fontSize: '13px', color: '#666' }}>
        Red — search results &nbsp;&nbsp;
        Green — highly accessible &nbsp;&nbsp;
        Yellow — fair &nbsp;&nbsp;
        Red — not accessible &nbsp;&nbsp;
        Blue — not yet rated
</div>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          key={mapKey}
          style={{ width: '100%', height: 'calc(100vh - 200px)', minHeight: '400px' }}
          defaultCenter={mapCenter}
          defaultZoom={mapZoom}
          mapId="accessibility-tracker-map"
        >
          {/* Search result markers: red */}
          {places.map(place => (
            <AdvancedMarker
              key={place.place_id}
              position={place.geometry.location}
              onClick={() => { setSelectedPlace(place); setSelectedBusiness(null); }}
            >
              <Pin background="#B71C1C" borderColor="#7B0000" glyphColor="white" />
            </AdvancedMarker>
          ))}

          {/* Saved business markers. Color coded by score */}
          {businesses.map(business => {
            const colors = getMarkerColor(business.overall_accessibility_score);
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
                  <p style={{ margin: '0 0 8px' }}>⭐ {selectedPlace.rating}</p>
                )}
                <button
                  onClick={() => saveBusiness(selectedPlace)}
                  style={{ padding: '6px 12px', backgroundColor: '#00ACC1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Save to Tracker
                </button>
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
                   Rate
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
  );
}
