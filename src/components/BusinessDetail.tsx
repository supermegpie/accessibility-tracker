import { useState, useEffect } from 'react';
import { Business } from '../hooks/useBusinesses';

interface Review {
  id: number;
  firebase_uid: string;
  mobility_score: number;
  sensory_score: number;
  service_score: number;
  restroom_score: number;
  parking_score: number;
  overall_score: number;
  comment: string;
  tags: string[];
  created_at: string;
}

interface BusinessDetailProps {
  business: Business;
  onClose: () => void;
  onRateClick: () => void;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 4 ? '#2E7D32' : score >= 3 ? '#E65100' : '#B71C1C';
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px' }}>{label}</span>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color }}>{score.toFixed(1)}/5</span>
      </div>
      <div style={{ backgroundColor: '#eee', borderRadius: '4px', height: '8px' }}>
        <div style={{
          backgroundColor: color,
          borderRadius: '4px',
          height: '8px',
          width: `${(score / 5) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}

export function BusinessDetail({ business, onClose, onRateClick }: BusinessDetailProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || '') + `/api/reviews/${business.id}`)
      .then(res => res.json())
      .then(data => { setReviews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [business.id]);

  const avgScore = (key: keyof Review) => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + (r[key] as number), 0) / reviews.length;
  };

  const overallScore = business.overall_accessibility_score;
  const scoreColor = overallScore >= 4 ? '#2E7D32' : overallScore >= 3 ? '#E65100' : overallScore ? '#B71C1C' : '#00ACC1';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px',
        padding: '24px', width: '560px', maxWidth: '90vw',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', color: '#00ACC1' }}>{business.name}</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{business.address}</p>
            {business.verified_features_count && Number(business.verified_features_count) > 0 && (
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#00ACC1', fontWeight: 'bold' }}>
                {business.verified_features_count} verified accessibility feature{Number(business.verified_features_count) > 1 ? 's' : ''} confirmed by the community
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>x</button>
        </div>

        {/* Overall Score */}
        <div style={{
          backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px',
          marginBottom: '20px', textAlign: 'center'
        }}>
          {overallScore ? (
            <>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: scoreColor }}>
                {Number(overallScore).toFixed(1)}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Overall Accessibility Score</div>
              <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </>
          ) : (
            <div style={{ color: '#666' }}>No reviews yet — be the first to rate!</div>
          )}
        </div>

        {/* Score Breakdown */}
        {reviews.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Score Breakdown</h3>
            <ScoreBar label="Mobility & Physical Access" score={avgScore('mobility_score')} />
            <ScoreBar label="Vision Accessibility" score={avgScore('vision_score')} />
            <ScoreBar label="Hearing Accessibility" score={avgScore('hearing_score')} />
            <ScoreBar label="Cognitive & Sensory" score={avgScore('sensory_score')} />
            <ScoreBar label="Staff & Service Quality" score={avgScore('service_score')} />
            <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '4px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#999' }}>Sub-scores</p>
              <ScoreBar label="Accessible Restrooms" score={avgScore('parking_score')} />
              <ScoreBar label="Parking & Transportation" score={avgScore('restroom_score')} />
            </div>
          </div>
        )}

        {/* Rate Button */}
        <button
          onClick={onRateClick}
          style={{
            width: '100%', padding: '12px', backgroundColor: '#2E7D32',
            color: 'white', border: 'none', borderRadius: '4px',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
            marginBottom: '20px'
          }}
        >
          Rate Accessibility
        </button>

        {/* Reviews List */}
        <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>
          Community Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h3>
        {loading && <p style={{ color: '#666' }}>Loading reviews...</p>}
        {!loading && reviews.length === 0 && (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No reviews yet. Be the first to share your experience!</p>
        )}
        {reviews.map(review => (
          <div key={review.id} style={{
            borderTop: '1px solid #eee', paddingTop: '12px', marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 'bold', color: scoreColor }}>
                Overall: {Number(review.overall_score).toFixed(1)}/5
              </span>
              <span style={{ fontSize: '12px', color: '#999' }}>
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Mobility & Physical Access: {review.mobility_score}/5</span>
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Sensory: {review.sensory_score}/5</span>
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Service: {review.service_score}/5</span>
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Parking & Transportation: {review.restroom_score}/5</span>
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Accessible Restrooms: {review.parking_score}/5</span>
            </div>
            {review.tags && review.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                {review.tags.map((tag: string, i: number) => (
                  <span key={i} style={{ backgroundColor: '#E0F7FA', color: '#006978', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {review.comment && (
              <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
