import { useState } from 'react';
import { auth } from '../firebase';

interface ReviewFormProps {
  businessId: number;
  businessName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

interface ScoreField {
  key: string;
  label: string;
  emoji: string;
}

const scoreFields: ScoreField[] = [
  { key: 'mobility_score', label: 'Mobility & Physical Access', emoji: '' },
  { key: 'sensory_score', label: 'Sensory Accessibility', emoji: '' },
  { key: 'service_score', label: 'Staff & Service Quality', emoji: '' },
  { key: 'restroom_score', label: 'Parking & Transportation', emoji: '' },
  { key: 'parking_score', label: 'Accessible Restrooms', emoji: '' },
];

const SUGGESTION_TAGS = [
  'ADA accessible main entrance',
  'ADA accessible entrance, but not the main entrance',
  'Bar/high top seating only',
  'Quiet or sensory room onsite',
  'Accessible/free parking provided',
  'Ramped main entrance',
  'Elevator',
  'Accessible restroom',
  'Restroom located on main floor',
  'ADA Vertical Platform lift (staff assistance required)',
  'Accessible reception area',
  'Staff available',
  'Maps provided (no tactile/braille)',
  'Tactile/braille maps/signage',
  'Interpretation boards provided',
  'Mostly mixed surfaces (carpet/gravel)',
  'Accessible play area',
];

export function ReviewForm({ businessId, businessName, onClose, onSubmitted }: ReviewFormProps) {
  const [scores, setScores] = useState<Record<string, number>>({
    mobility_score: 3,
    sensory_score: 3,
    service_score: 3,
    restroom_score: 3,
    parking_score: 3,
  });
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to submit a review.');
        setSubmitting(false);
        return;
      }

      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          firebase_uid: user.uid,
          ...scores,
          comment,
          tags: selectedTags
        })
      });

      const data = await response.json();
      if (response.ok) {
        onSubmitted();
        onClose();
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (_err) {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px',
        padding: '24px', width: '520px', maxWidth: '90vw',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <h2 style={{ margin: '0 0 4px', color: '#00ACC1' }}>Share Your Experience</h2>
        <p style={{ margin: '0 0 4px', color: '#666' }}>{businessName}</p>
        <p style={{ margin: '0 0 20px', color: '#999', fontSize: '13px' }}>Your review helps others in the community find accessible places.</p>

        {scoreFields.map(field => (
          <div key={field.key} style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              {field.label}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  onClick={() => setScores(prev => ({ ...prev, [field.key]: score }))}
                  style={{
                    width: '40px', height: '40px', borderRadius: '4px',
                    border: '2px solid',
                    borderColor: scores[field.key] === score ? '#00ACC1' : '#ddd',
                    backgroundColor: scores[field.key] === score ? '#00ACC1' : 'white',
                    color: scores[field.key] === score ? 'white' : '#333',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
                  }}
                >
                  {score}
                </button>
              ))}
              <span style={{ marginLeft: '8px', color: '#666', alignSelf: 'center' }}>
                {scores[field.key] === 1 ? 'Not accessible' :
                 scores[field.key] === 2 ? 'Poor' :
                 scores[field.key] === 3 ? 'Fair' :
                 scores[field.key] === 4 ? 'Good' : 'Excellent'}
              </span>
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Accessibility Features (select all that apply)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SUGGESTION_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedTags.includes(tag) ? '#00ACC1' : '#ddd',
                  backgroundColor: selectedTags.includes(tag) ? '#E0F7FA' : 'white',
                  color: selectedTags.includes(tag) ? '#006978' : '#555',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: selectedTags.includes(tag) ? 'bold' : 'normal',
                  transition: 'all 0.15s ease'
                }}
              >
                {selectedTags.includes(tag) ? '+ ' : ''}{tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#00ACC1' }}>
              {selectedTags.length} feature{selectedTags.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
            Additional Comments (optional, but recommended)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </div>

        {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 20px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: 'white' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: '#00ACC1', color: 'white', fontWeight: 'bold' }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
