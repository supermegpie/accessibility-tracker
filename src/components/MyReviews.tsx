import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface UserReview {
  id: number;
  business_name: string;
  business_address: string;
  overall_score: number;
  mobility_score: number;
  vision_score: number;
  hearing_score: number;
  sensory_score: number;
  service_score: number;
  comment: string;
  tags: string[];
  created_at: string;
  google_place_id: string;
  overall_accessibility_score: number;
}

const scoreColor = (score: number) => {
  if (score === 0) return '#7B0000';
  if (score >= 4) return '#2E7D32';
  if (score >= 3) return '#E65100';
  return '#B71C1C';
};

const scoreLabel = (score: number) => {
  if (score === 0) return 'Cannot enter';
  if (score >= 4) return 'Good access';
  if (score >= 3) return 'Fair access';
  if (score >= 2) return 'Poor access';
  return 'Cannot enter';
};

export function MyReviews() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const res = await fetch(
          (import.meta.env.VITE_API_URL || '') + `/api/reviews/user/${user.uid}`
        );
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
      setLoading(false);
    };
    fetchReviews();
  }, []);

  const CATEGORY_LABELS: Record<string, string> = {
    mobility_score: 'Mobility',
    vision_score: 'Vision',
    hearing_score: 'Hearing',
    sensory_score: 'Cognitive & Sensory',
    service_score: 'Service',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ color: '#00ACC1', fontSize: '26px', marginBottom: '8px' }}>My Reviews</h2>
      <div style={{ width: '48px', height: '4px', backgroundColor: '#F06292', borderRadius: '2px', marginBottom: '24px' }} />

      {loading && <p style={{ color: '#666' }}>Loading your reviews...</p>}

      {!loading && reviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
            You have not submitted any reviews yet.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '10px 24px', backgroundColor: '#00ACC1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Find a business to review
          </button>
        </div>
      )}

      {reviews.map(review => (
        <div key={review.id} style={{
          backgroundColor: 'white', borderRadius: '8px', padding: '20px',
          marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          borderLeft: `4px solid ${scoreColor(review.overall_score)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', color: '#00ACC1' }}>{review.business_name}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{review.business_address}</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#999' }}>
                Reviewed on {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: scoreColor(review.overall_score),
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 'bold', fontSize: '16px'
              }}>
                {review.overall_score?.toFixed(1)}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#999' }}>{scoreLabel(review.overall_score)}</p>
            </div>
          </div>

          {/* Category scores */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const score = review[key as keyof UserReview] as number;
              if (!score && score !== 0) return null;
              return (
                <span key={key} style={{
                  backgroundColor: '#F0F4F3', padding: '3px 10px', borderRadius: '12px',
                  fontSize: '12px', color: '#444'
                }}>
                  {label}: <strong style={{ color: scoreColor(score) }}>{score}/5</strong>
                </span>
              );
            })}
          </div>

          {/* Tags */}
          {review.tags && review.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {review.tags.map((tag, i) => (
                <span key={i} style={{
                  backgroundColor: '#E0F7FA', color: '#006978',
                  padding: '2px 8px', borderRadius: '10px', fontSize: '11px'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comment */}
          {review.comment && (
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#444', fontStyle: 'italic' }}>
              "{review.comment}"
            </p>
          )}

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '6px 14px', backgroundColor: 'transparent',
              color: '#00ACC1', border: '1px solid #00ACC1',
              borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
            }}
          >
            View on Map
          </button>
        </div>
      ))}
    </div>
  );
}
