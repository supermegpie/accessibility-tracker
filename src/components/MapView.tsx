import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { useBusinesses, Business } from '../hooks/useBusinesses';
import { ReviewForm } from './ReviewForm';

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

export function MapView() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [mapCenter, setMapCenter] = useState(CHICAGO_CENTER);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { businesses, refetch } = useBusinesses();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const searchPlaces = async () => {
    if (!searchInput) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/places/search?location=${encodeURIComponent(searchInput)}&type=restaurant`
      );
      const data = await response.json();
      setPlaces(data.places);
      setMapCenter(data.center);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const saveBusiness = async (place: Place) => {
    try {
      const response = await fetch('/api/businesses', {
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

  const getMarkerColor = (score: number | null) => {
    if (!score) return { background: '#1E4D8C', border: '#0D2B4E' }; // Blue - not rated
    if (score >= 4) return { background: '#27AE60', border: '#1A7A40' }; // Green - highly accessible
    if (score >= 3) return { background: '#F39C12', border: '#B7770D' }; // Yellow - fair
    return { background: '#E74C3C', border: '#A93226' }; // Red - not accessible
  };

  return (
    <div>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search location (e.g. Chicago, IL)"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchPlaces()}
          style={{ padding: '8px', width: '300px' }}
        />
        <button
          onClick={searchPlaces}
          style={{ padding: '8px 16px' }}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <span style={{ fontSize: '14px', color: '#666' }}>
          📍 {businesses.length} businesses tracked
        </span>
      </div>
      {saveMessage && (
        <p style={{ color: 'green', marginBottom: '10px' }}>{saveMessage}</p>
      )}
      <div style={{ marginBottom: '8px', fontSize: '13px', color: '#666' }}>
        🔴 Search results &nbsp;&nbsp;
        🟢 Highly accessible &nbsp;&nbsp;
        🟡 Fair &nbsp;&nbsp;
        🔴 Not accessible &nbsp;&nbsp;
        🔵 Not yet rated
      </div>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: '100%', height: '500px' }}
          center={mapCenter}
          zoom={13}
          mapId="accessibility-tracker-map"
        >
          {/* Search result markers - red */}
          {places.map(place => (
            <AdvancedMarker
              key={place.place_id}
              position={place.geometry.location}
              onClick={() => { setSelectedPlace(place); setSelectedBusiness(null); }}
            >
              <Pin background="#EA4335" borderColor="#B31412" glyphColor="white" />
            </AdvancedMarker>
          ))}

          {/* Saved business markers - color coded by score */}
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
                  style={{ padding: '6px 12px', backgroundColor: '#1E4D8C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
                <p style={{ margin: '0 0 8px', color: '#1E4D8C', fontWeight: 'bold' }}>✅ Saved to Tracker</p>
                {selectedBusiness.overall_accessibility_score && (
                <p style={{ margin: '0 0 8px' }}>♿ Score: {selectedBusiness.overall_accessibility_score}</p>
                 )}
                <button
                  onClick={() => setShowReviewForm(true)}
                  style={{ padding: '6px 12px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Rate Accessibility
                </button>
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
    </div>
  );
}
