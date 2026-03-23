import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

const CHICAGO_CENTER = { lat: 41.8781, lng: -87.6298 };

export function MapView() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        style={{ width: '100%', height: '500px' }}
        defaultCenter={CHICAGO_CENTER}
        defaultZoom={12}
        mapId="accessibility-tracker-map"
      >
        <AdvancedMarker position={CHICAGO_CENTER} />
      </Map>
    </APIProvider>
  );
}