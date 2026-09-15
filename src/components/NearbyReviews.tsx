import { useState, useEffect } from 'react';

interface NearbyBusiness {
  id: number;
  name: string;
  address: string;
  overall_accessibility_score: number;
  google_rating: number;
  business_type: string;
  review_count: string;
  latest_comment: string;
  latest_reviewer: string;
  distance_miles: number;
  verified_features_count: string;
  latitude: string;
  longitude: string;
}

const scoreColor = (score: number | string | null) => {
  const s = Number(score);
  if (!score && score !== 0) return '#00ACC1';
  if (s === 0) return '#7B0000';
  if (s >= 4) return '#2E7D32';
  if (s >= 3) return '#E65100';
  return '#B71C1C';
};

interface NearbyReviewsProps {
  center: { lat: number; lng: number };
  onBusinessClick: (business: NearbyBusiness) => void;
}

export function NearbyReviews({ center, onBusinessClick }: NearbyReviewsProps) {
  const [businesses, setBusinesses] = useState<NearbyBusiness[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNearby = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          (import.meta.env.VITE_API_URL || '') +
          `/api/businesses/nearby?lat=${center.lat}&lng=${center.lng}&limit=15`
        );
        const data = await res.json();
        setBusinesses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch nearby:', err);
      }
      setLoading(false);
    };
    fetchNearby();
  }, [center.lat, center.lng]);

  return (
    <div style={{
      width: '300px',
      flexShrink: 0,
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 200px)',
    }}>
      <div style={{ padding: '14px 16px', backgroundColor: '#006978', color: 'white' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Nearby Reviews</h3>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
          Sorted by distance and score
        </p>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading && (
          <p style={{ padding: '16px', color: '#666', fontSize: '13px', textAlign: 'center' }}>
            Loading nearby businesses...
          </p>
        )}

        {!loading && businesses.length === 0 && (
          <p style={{ padding: '16px', color: '#666', fontSize: '13px', textAlign: 'center' }}>
            No reviewed businesses nearby. Be the first to review!
          </p>
        )}

        {businesses.map(business => (
          <div
            key={business.id}
            onClick={() => onBusinessClick(business)}
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0F4F3')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#222', flex: 1, paddingRight: '8px' }}>
                {business.name}
              </p>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: scoreColor(business.overall_accessibility_score),
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 'bold', fontSize: '11px'
              }}>
                {Number(business.overall_accessibility_score)?.toFixed(1)}
              </div>
            </div>

            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999' }}>
              {business.distance_miles < 0.1
                ? 'Less than 0.1 miles away'
                : `${Number(business.distance_miles).toFixed(1)} miles away`}
              {' · '}
              {business.review_count} {Number(business.review_count) === 1 ? 'review' : 'reviews'}
            </p>

            {business.latest_comment && (
              <p style={{
                margin: '4px 0 0', fontSize: '12px', color: '#555', fontStyle: 'italic',
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const
              }}>
                "{business.latest_comment}"
              </p>
            )}

            {business.latest_reviewer && (
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#00ACC1' }}>
                — {business.latest_reviewer}
              </p>
            )}

            {Number(business.verified_features_count) > 0 && (
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#006978' }}>
                {business.verified_features_count} verified feature{Number(business.verified_features_count) > 1 ? 's' : ''}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
