import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

const CHICAGO_CENTER = { lat: 41.8781, lng: -87.6298 };

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
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
              <div>
                <h3 style={{ margin: '0 0 4px' }}>{selectedPlace.name}</h3>
                <p style={{ margin: '0 0 4px' }}>{selectedPlace.vicinity}</p>
                {selectedPlace.rating && (
                  <p style={{ margin: 0 }}>⭐ {selectedPlace.rating}</p>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
