import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useParams } from 'react-router-dom';

const VIBES = ['Date Night', 'Family Day', 'Adventure', 'Foodie', 'Culture & Arts', 'Shopping'];

const VIBE_DEFAULTS: Record<string, string[]> = {
  'Date Night': ['cocktail bar', 'fine dining restaurant', 'dessert cafe'],
  'Family Day': ['park', 'family restaurant', 'museum'],
  'Adventure': ['outdoor activity', 'cafe', 'sports bar'],
  'Foodie': ['coffee shop', 'restaurant', 'dessert'],
  'Culture & Arts': ['museum', 'art gallery', 'cafe'],
  'Shopping': ['shopping mall', 'cafe', 'restaurant'],
};

const VIBE_COLORS: Record<string, string> = {
  'Date Night': '#F06292',
  'Family Day': '#00ACC1',
  'Adventure': '#2E7D32',
  'Foodie': '#E65100',
  'Culture & Arts': '#6A1B9A',
  'Shopping': '#006978',
};

interface ElevatorInfo {
  station_name: string;
  transit_line: string;
  entrance_location: string;
  notes: string;
  is_working: boolean;
}

interface Stop {
  stop_number: number;
  stop_type: string;
  name: string;
  address: string;
  place_id: string;
  location: { lat: number; lng: number };
  google_rating: number;
  accessibility_score: number;
  directions_url: string;
  nearby_elevator_info: ElevatorInfo[];
}

export function DayPlanner() {
  const { shareId } = useParams();
  const [city, setCity] = useState('Chicago, IL');
  const [vibe, setVibe] = useState('');
  const [stopCount, setStopCount] = useState(3);
  const [customStops, setCustomStops] = useState<string[]>([]);
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Stop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  useEffect(() => {
    if (shareId) {
      fetch((import.meta.env.VITE_API_URL || '') + `/api/day-planner/share/${shareId}`)
        .then(r => r.json())
        .then(data => {
          setCity(data.city);
          setVibe(data.vibe);
          setResults(data.stops);
        })
        .catch(err => console.error('Failed to load shared plan:', err));
    }
  }, [shareId]);

  useEffect(() => {
    if (vibe && !useCustom) {
      const defaults = VIBE_DEFAULTS[vibe] || [];
      setCustomStops(defaults.slice(0, stopCount));
      setStopCount(defaults.length);
    }
  }, [vibe]);

  const handleStopCountChange = (count: number) => {
    setStopCount(count);
    if (!useCustom && vibe) {
      const defaults = VIBE_DEFAULTS[vibe] || [];
      const newStops = [...defaults];
      while (newStops.length < count) newStops.push('');
      setCustomStops(newStops.slice(0, count));
    } else {
      const newStops = [...customStops];
      while (newStops.length < count) newStops.push('');
      setCustomStops(newStops.slice(0, count));
    }
  };

  const search = async () => {
    if (!city || !vibe) { setError('Please enter a city and select a vibe.'); return; }
    setLoading(true);
    setError(null);
    setResults([]);
    setShareLink(null);
    try {
      const stopsParam = customStops.filter(s => s).join(',');
      const url = (import.meta.env.VITE_API_URL || '') +
        `/api/day-planner/search?city=${encodeURIComponent(city)}&vibe=${encodeURIComponent(vibe)}&stops=${encodeURIComponent(stopsParam)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.stops);
      setMapKey(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const share = async () => {
    setSharing(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/day-planner/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, vibe, stops: results })
      });
      const data = await res.json();
      const link = window.location.origin + '/day-planner/share/' + data.share_id;
      setShareLink(link);
      navigator.clipboard.writeText(link).catch(() => {});
    } catch (err) {
      console.error('Share failed:', err);
    }
    setSharing(false);
  };

  const vibeColor = vibe ? VIBE_COLORS[vibe] : '#00ACC1';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ color: '#00ACC1', fontSize: '26px', marginBottom: '8px' }}>Plan an Accessible Day</h2>
      <div style={{ width: '48px', height: '4px', backgroundColor: '#F06292', borderRadius: '2px', marginBottom: '16px' }} />
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
        Use this tool to build an accessible day out. We will help you find the most wheelchair friendly, sensory accessible stops near each other to minimize travel stress. Transit elevator info is included for each stop.
      </p>

      {/* Search form */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>

        {/* City input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '6px' }}>City</label>
          <input
            type="text"
            placeholder="e.g. Chicago, IL"
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Vibe selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>What kind of day?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {VIBES.map(v => (
              <button
                key={v}
                onClick={() => setVibe(v)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', border: '2px solid',
                  borderColor: vibe === v ? VIBE_COLORS[v] : '#ddd',
                  backgroundColor: vibe === v ? VIBE_COLORS[v] : 'white',
                  color: vibe === v ? 'white' : '#555',
                  cursor: 'pointer', fontSize: '14px', fontWeight: vibe === v ? 'bold' : 'normal',
                  transition: 'all 0.15s ease'
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Stop count */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
            How many stops? <span style={{ color: '#00ACC1', fontWeight: 'bold' }}>{stopCount}</span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => handleStopCountChange(n)}
                style={{
                  width: '44px', height: '44px', borderRadius: '4px', border: '2px solid',
                  borderColor: stopCount === n ? '#00ACC1' : '#ddd',
                  backgroundColor: stopCount === n ? '#00ACC1' : 'white',
                  color: stopCount === n ? 'white' : '#555',
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Custom stops */}
        {vibe && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#444' }}>Customize your stops</label>
              <button
                onClick={() => setUseCustom(!useCustom)}
                style={{ fontSize: '12px', color: '#00ACC1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {useCustom ? 'Use vibe defaults' : 'Customize'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {customStops.map((stop, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: vibeColor, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '13px', flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    value={stop}
                    onChange={e => {
                      const updated = [...customStops];
                      updated[i] = e.target.value;
                      setCustomStops(updated);
                      setUseCustom(true);
                    }}
                    placeholder={`Stop ${i + 1} type (e.g. coffee shop)`}
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={search}
          disabled={loading || !vibe || !city}
          style={{
            padding: '12px 32px', backgroundColor: vibeColor, color: 'white',
            border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold', fontSize: '15px', opacity: loading || !vibe || !city ? 0.7 : 1
          }}
        >
          {loading ? 'Planning your day...' : 'Plan My Day'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FFEBEE', border: '1px solid #B71C1C', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', color: '#B71C1C' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p style={{ marginBottom: '8px', fontSize: '16px' }}>Finding the most accessible stops near each other...</p>
          <p style={{ fontSize: '13px' }}>Checking Google accessibility data, community reviews, and elevator info</p>
        </div>
      )}

      {results.length > 0 && !loading && (
        <div>
          {/* Map */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#00ACC1' }}>Your {vibe} Day in {city}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={share}
                  disabled={sharing}
                  style={{ padding: '8px 16px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  {sharing ? 'Saving...' : 'Share Plan'}
                </button>
                {shareLink && (
                  <span style={{ fontSize: '13px', color: '#2E7D32', fontWeight: 'bold' }}>Link copied!</span>
                )}
              </div>
            </div>

            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <Map
                key={mapKey}
                style={{ width: '100%', height: '300px', borderRadius: '8px' }}
                defaultCenter={results[0].location}
                defaultZoom={14}
                mapId="day-planner-map"
              >
                {results.map((stop, i) => (
                  <AdvancedMarker
                    key={stop.place_id}
                    position={stop.location}
                    onClick={() => setSelectedStop(selectedStop?.place_id === stop.place_id ? null : stop)}
                  >
                    <Pin
                      background={vibeColor}
                      borderColor="#333"
                      glyph={String(i + 1)}
                      glyphColor="white"
                    />
                  </AdvancedMarker>
                ))}
                {selectedStop && (
                  <InfoWindow
                    position={selectedStop.location}
                    onCloseClick={() => setSelectedStop(null)}
                  >
                    <div style={{ minWidth: '200px', fontFamily: 'Poppins, Arial, sans-serif' }}>
                      <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>{selectedStop.stop_type}</p>
                      <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#00ACC1' }}>{selectedStop.name}</h3>
                      <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#666' }}>{selectedStop.address}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {selectedStop.google_rating && (
                          <span style={{ backgroundColor: '#f0f0f0', color: '#333', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                            {selectedStop.google_rating} stars
                          </span>
                        )}
                        <span style={{ backgroundColor: selectedStop.accessibility_score >= 50 ? '#E8F5E9' : '#FFF3E0', color: selectedStop.accessibility_score >= 50 ? '#1B5E20' : '#E65100', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                          {selectedStop.accessibility_score}% accessible
                        </span>
                      </div>
                      {selectedStop.nearby_elevator_info && selectedStop.nearby_elevator_info.length > 0 && (
                        <div style={{ backgroundColor: '#E0F7FA', borderRadius: '4px', padding: '6px 8px', marginBottom: '8px' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 'bold', color: '#006978' }}>Nearby elevator info:</p>
                          {selectedStop.nearby_elevator_info.slice(0, 1).map((elev, j) => (
                            <p key={j} style={{ margin: 0, fontSize: '11px', color: '#444' }}>
                              {elev.station_name} — {elev.transit_line}
                              <span style={{ marginLeft: '4px', color: elev.is_working ? '#2E7D32' : '#B71C1C', fontWeight: 'bold' }}>
                                {elev.is_working ? 'Working' : 'Out of service'}
                              </span>
                            </p>
                          ))}
                        </div>
                      )}
                      <a
                        href={selectedStop.directions_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#00ACC1', color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        Get Directions
                      </a>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </div>

          {/* Stop cards */}
          {results.map((stop, i) => (
            <div key={stop.place_id} style={{
              backgroundColor: 'white', borderRadius: '8px', padding: '20px',
              marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              borderLeft: `4px solid ${vibeColor}`
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: vibeColor, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '16px', flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stop.stop_type}</p>
                      <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#00ACC1' }}>{stop.name}</h3>
                      <p style={{ margin: '0 0 8px', color: '#666', fontSize: '14px' }}>{stop.address}</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {stop.google_rating && (
                          <span style={{ backgroundColor: '#f0f0f0', color: '#333', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
                            {stop.google_rating} Google Rating
                          </span>
                        )}
                        <span style={{ backgroundColor: stop.accessibility_score >= 50 ? '#E8F5E9' : '#FFF3E0', color: stop.accessibility_score >= 50 ? '#1B5E20' : '#E65100', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          {stop.accessibility_score}% Accessibility Score
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transit & Elevator Info */}
                  {stop.nearby_elevator_info && stop.nearby_elevator_info.length > 0 && (
                    <div style={{ backgroundColor: '#E0F7FA', borderRadius: '6px', padding: '10px 14px', marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 'bold', color: '#006978' }}>
                        Nearby Transit Elevator Info (community verified)
                      </p>
                      {stop.nearby_elevator_info.slice(0, 2).map((elev, j) => (
                        <div key={j} style={{ marginBottom: j < stop.nearby_elevator_info.length - 1 ? '6px' : 0 }}>
                          <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#444' }}>
                            <strong>{elev.station_name}</strong> — {elev.transit_line}
                            <span style={{ marginLeft: '8px', backgroundColor: elev.is_working ? '#E8F5E9' : '#FFEBEE', color: elev.is_working ? '#2E7D32' : '#B71C1C', padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                              {elev.is_working ? 'Elevator working' : 'Out of service'}
                            </span>
                          </p>
                          {elev.entrance_location && (
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Location: {elev.entrance_location}</p>
                          )}
                          {elev.notes && (
                            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontStyle: 'italic' }}>{elev.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <a
                    href={stop.directions_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#00ACC1', color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    Get Transit Directions
                  </a>

                  {i < results.length - 1 && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(stop.address)}&destination=${encodeURIComponent(results[i + 1].address)}&travelmode=transit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginLeft: '8px', padding: '8px 16px', backgroundColor: '#006978', color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      Directions to Next Stop
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
