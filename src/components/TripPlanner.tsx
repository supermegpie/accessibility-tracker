import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface TripResult {
  place_id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  google_rating: number;
  google_accessible: boolean;
  accessibility_score: number;
  community_score: number | null;
  review_count: number;
  factors: string[];
  warnings: string[];
  types: string[];
}

interface TripPlannerProps {
  user: User;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? '#27AE60' : score >= 50 ? '#F39C12' : '#E74C3C';
  const label = score >= 70 ? 'Highly Accessible' : score >= 50 ? 'Moderately Accessible' : 'Limited Accessibility';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '70px', height: '70px', borderRadius: '50%',
        backgroundColor: color, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', fontWeight: 'bold', margin: '0 auto 6px'
      }}>
        {score}%
      </div>
      <div style={{ fontSize: '11px', color, fontWeight: 'bold' }}>{label}</div>
    </div>
  );
}

export function TripPlanner({ user: _user }: TripPlannerProps) {
  const { shareId } = useParams<{ shareId?: string }>();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Chicago, IL');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TripResult[]>([]);
  const [ctaOutages, setCtaOutages] = useState(0);
  const [metraOutages, setMetraOutages] = useState(0);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (shareId) {
      fetch('/api/trip-planner/share/' + shareId)
        .then(res => res.json())
        .then(data => {
          setQuery(data.query);
          setCity(data.city);
          setResults(data.results);
          setCtaOutages(data.cta_outages || 0);
          setSearched(true);
        })
        .catch(err => console.error('Failed to load shared results:', err));
    }
  }, [shareId]);

  const search = async () => {
    if (!query || !city) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    setShareUrl(null);
    try {
      const response = await fetch(
        '/api/trip-planner/search?query=' + encodeURIComponent(query) + '&city=' + encodeURIComponent(city)
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResults(data.results);
      setCtaOutages(data.cta_outages || 0);
      setMetraOutages(data.metra_outages || 0);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
    setLoading(false);
  };

  const shareResults = async () => {
    setSharing(true);
    try {
      const response = await fetch('/api/trip-planner/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, city, results, cta_outages: ctaOutages })
      });
      const data = await response.json();
      const url = window.location.origin + '/trip-planner/share/' + data.share_id;
      setShareUrl(url);
      navigator.clipboard.writeText(url).catch(() => {});
    } catch (err) {
      console.error('Share failed:', err);
    }
    setSharing(false);
  };

  const hasOutages = ctaOutages > 0 || metraOutages > 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px', color: '#1E4D8C', fontSize: '24px' }}>
          Accessible Trip Planner
        </h2>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Find the top 5 most accessible destinations based on Google data, community reviews, and real-time CTA, Metra, and Pace transit status.
        </p>
      </div>

      <div style={{
        backgroundColor: 'white', borderRadius: '8px',
        padding: '20px', marginBottom: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '6px' }}>
              What are you looking for?
            </label>
            <input
              type="text"
              placeholder="e.g. Italian restaurant, sports bar, coffee shop"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              style={{
                width: '100%', padding: '10px', borderRadius: '4px',
                border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '6px' }}>
              City
            </label>
            <input
              type="text"
              placeholder="e.g. Chicago, IL"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              style={{
                width: '100%', padding: '10px', borderRadius: '4px',
                border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={search}
              disabled={loading || !query}
              style={{
                padding: '10px 24px', backgroundColor: '#1E4D8C',
                color: 'white', border: 'none', borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold', fontSize: '15px',
                opacity: loading || !query ? 0.7 : 1
              }}
            >
              {loading ? 'Searching...' : 'Find Top 5'}
            </button>
          </div>
        </div>
      </div>

      {searched && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            backgroundColor: hasOutages ? '#FFF3CD' : '#D4EDDA',
            border: hasOutages ? '1px solid #F39C12' : '1px solid #27AE60',
            borderRadius: '6px', padding: '12px 16px',
            marginBottom: '8px', fontSize: '14px',
            color: hasOutages ? '#856404' : '#155724'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>
                  {ctaOutages > 0
                    ? 'CTA: ' + ctaOutages + ' elevator outage(s) reported'
                    : 'CTA: No elevator outages reported'
                  }
                </span>
                <span>
                  {metraOutages > 0
                    ? 'Metra: ' + metraOutages + ' accessibility alert(s) reported'
                    : 'Metra: No accessibility alerts reported'
                  }
                </span>
                <span style={{ fontSize: '12px', color: '#888' }}>
                  Pace Bus: Visit pacebus.com for real-time accessibility info
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ctaOutages > 0 && (
                  <a
                    href="https://www.transitchicago.com/alerts/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#F39C12', color: 'white',
                      padding: '4px 12px', borderRadius: '4px',
                      fontSize: '13px', fontWeight: 'bold',
                      textDecoration: 'none', whiteSpace: 'nowrap'
                    }}
                  >
                    CTA Alerts
                  </a>
                )}
                {metraOutages > 0 && (
                  <a
                    href="https://metrarail.com/alerts"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#F39C12', color: 'white',
                      padding: '4px 12px', borderRadius: '4px',
                      fontSize: '13px', fontWeight: 'bold',
                      textDecoration: 'none', whiteSpace: 'nowrap'
                    }}
                  >
                    Metra Alerts
                  </a>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={shareResults}
              disabled={sharing}
              style={{
                padding: '8px 16px', backgroundColor: '#27AE60',
                color: 'white', border: 'none', borderRadius: '4px',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
              }}
            >
              {sharing ? 'Copying...' : 'Share Results'}
            </button>
            {shareUrl && (
              <span style={{ fontSize: '13px', color: '#27AE60', fontWeight: 'bold' }}>
                Link copied to clipboard!
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#F8D7DA', border: '1px solid #E74C3C', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', color: '#721C24' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>♿</div>
          <p>Searching for accessible destinations...</p>
          <p style={{ fontSize: '13px' }}>Checking Google Places, community reviews, CTA, Metra and Pace status</p>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No results found. Try a different search.</p>
        </div>
      )}

      {searched && !loading && results.length > 0 && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#1E4D8C' }}>
              Top {results.length} Accessible Results for {query}
            </h3>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <Map
                style={{ width: '100%', height: '300px', borderRadius: '8px' }}
                defaultCenter={{ lat: results[0].location.lat, lng: results[0].location.lng }}
                defaultZoom={13}
                mapId="trip-planner-map"
              >
                {results.map((result, index) => (
                  <AdvancedMarker
                    key={result.place_id}
                    position={{ lat: result.location.lat, lng: result.location.lng }}
                  >
                    <Pin
                      background={result.accessibility_score >= 70 ? '#27AE60' : result.accessibility_score >= 50 ? '#F39C12' : '#E74C3C'}
                      borderColor="#333"
                      glyph={String(index + 1)}
                      glyphColor="white"
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>

          {results.map((result, index) => (
            <div key={result.place_id} style={{
              backgroundColor: 'white', borderRadius: '8px',
              padding: '20px', marginBottom: '16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              borderLeft: '4px solid ' + (result.accessibility_score >= 70 ? '#27AE60' : result.accessibility_score >= 50 ? '#F39C12' : '#E74C3C')
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: '#1E4D8C', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1E4D8C' }}>{result.name}</h3>
                      <p style={{ margin: '0 0 8px', color: '#666', fontSize: '14px' }}>{result.address}</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {result.google_accessible && (
                          <span style={{ backgroundColor: '#D4EDDA', color: '#155724', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                            Google Verified Accessible
                          </span>
                        )}
                        {result.google_rating && (
                          <span style={{ backgroundColor: '#f0f0f0', color: '#333', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
                            {result.google_rating} Google Rating
                          </span>
                        )}
                        {result.community_score && (
                          <span style={{ backgroundColor: '#D4EDDA', color: '#155724', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
                            {Number(result.community_score).toFixed(1)}/5 Community Score
                          </span>
                        )}
                        {result.review_count > 0 && (
                          <span style={{ backgroundColor: '#f0f0f0', color: '#333', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
                            {result.review_count} community review{result.review_count > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <ScoreBadge score={result.accessibility_score} />
                  </div>

                  {result.factors.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#27AE60', marginBottom: '4px' }}>
                        Why it ranked well:
                      </div>
                      {result.factors.map((factor, i) => (
                        <div key={i} style={{ fontSize: '13px', color: '#444', marginBottom: '2px' }}>
                          {factor}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.warnings.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#F39C12', marginBottom: '4px' }}>
                        Things to know:
                      </div>
                      {result.warnings.map((warning, i) => (
                        <div key={i} style={{ fontSize: '13px', color: '#856404', marginBottom: '2px' }}>
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}

                  <a
                    href={'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(result.address) + '&destination_place_id=' + result.place_id + '&travelmode=transit'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: '#1E4D8C',
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
