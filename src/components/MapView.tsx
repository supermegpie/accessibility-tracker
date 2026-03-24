import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

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
  const [mapCenter, setMapCenter] = useState(CHICAGO_CENTER);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
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
      </div>
      {saveMessage && (
        <p style={{ color: 'green', marginBottom: '10px' }}>{saveMessage}</p>
      )}
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: '100%', height: '500px' }}
          center={mapCenter}
          zoom={13}
          mapId="accessibility-tracker-map"
        >
          {places.map(place => (
            <AdvancedMarker
              key={place.place_id}
              position={place.geometry.location}
              onClick={() => setSelectedPlace(place)}
            />
          ))}
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
        </Map>
      </APIProvider>
    </div>
  );
}
