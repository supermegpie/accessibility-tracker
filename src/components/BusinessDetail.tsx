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
  created_at: string;
}

interface BusinessDetailProps {
  business: Business;
  onClose: () => void;
  onRateClick: () => void;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 4 ? '#27AE60' : score >= 3 ? '#F39C12' : '#E74C3C';
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
    fetch(`/api/reviews/${business.id}`)
      .then(res => res.json())
      .then(data => { setReviews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [business.id]);

  const avgScore = (key: keyof Review) => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + (r[key] as number), 0) / reviews.length;
  };

  const overallScore = business.overall_accessibility_score;
  const scoreColor = overallScore >= 4 ? '#27AE60' : overallScore >= 3 ? '#F39C12' : overallScore ? '#E74C3C' : '#1E4D8C';

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
            <h2 style={{ margin: '0 0 4px', color: '#1E4D8C' }}>{business.name}</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{business.address}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
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
            <ScoreBar label="Wheelchair & Mobility Access" score={avgScore('mobility_score')} />
            <ScoreBar label="Sensory Accessibility" score={avgScore('sensory_score')} />
            <ScoreBar label="Staff & Service Quality" score={avgScore('service_score')} />
            <ScoreBar label="Accessible Restrooms" score={avgScore('restroom_score')} />
            <ScoreBar label="Accessible Parking" score={avgScore('parking_score')} />
          </div>
        )}

        {/* Rate Button */}
        <button
          onClick={onRateClick}
          style={{
            width: '100%', padding: '12px', backgroundColor: '#27AE60',
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
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Mobility: {review.mobility_score}/5</span>
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Sensory: {review.sensory_score}/5</span>
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Service: {review.service_score}/5</span>
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Restroom: {review.restroom_score}/5</span>
              <span style={{ fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>Parking: {review.parking_score}/5</span>
            </div>
            {review.comment && (
              <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
