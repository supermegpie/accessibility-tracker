import { useState, useEffect } from 'react';
import { auth } from '../firebase';

interface UserProfile {
  disability_categories?: string[];
  identifies_as_disabled?: boolean;
  is_caregiver?: boolean;
}

interface ReviewFormProps {
  businessId: number;
  businessName: string;
  onClose: () => void;
  onSubmitted: () => void;
  userProfile?: UserProfile;
}

// ─── Tier definitions ────

const CATEGORIES = [
  { key: 'mobility', label: 'Mobility & Physical Access' },
  { key: 'vision', label: 'Vision Accessibility' },
  { key: 'hearing', label: 'Hearing Accessibility' },
  { key: 'sensory', label: 'Cognitive & Sensory' },
];

const TIERS: Record<string, {
  tier1: { q1: string; q2: string };
  tier2: { q1: string; q2: string };
  tier3: string[];
  warnings: string[];
}> = {
  mobility: {
    tier1: {
      q1: 'Is there a step-free entry into the business?',
      q2: 'If there are steps, is there a ramp available?',
    },
    tier2: {
      q1: 'Are doorways wide enough for a mobility device (≥32 inches)?',
      q2: 'Are aisles wide enough to move through with a mobility device (≥36 inches)?',
    },
    tier3: [
      'Automatic door opener',
      'Lever style door handles (not knobs)',
      'Elevator or lift for multi-floor access',
      'Accessible restroom with grab bars',
      'Accessible restroom stall door swings outward',
      'Lowered service counter (≤36 inches)',
      'Designated accessible parking with access aisle',
      'Accessible route from parking to entrance (firm, level surface)',
      'Turning space inside (≥60 inch diameter)',
      'Accessible seating available',
    ],
    warnings: [
      'Accessible entrance is not the main entrance',
      'Staff assistance required to access',
      'Route includes gravel, grass, or uneven surfaces',
      'Ramp slope appears steep',
    ],
  },
  vision: {
    tier1: {
      q1: 'Is there adequate and consistent lighting throughout the space?',
      q2: 'Is there no significant glare from high-gloss floors or unshaded windows?',
    },
    tier2: {
      q1: 'Is there high contrast between floors, walls, and furniture?',
      q2: 'Is signage clear, large enough to read, and at eye level?',
    },
    tier3: [
      'Braille or tactile signage available',
      'Large print menus or materials available',
      'Elevator has braille buttons and audible floor announcements',
      'Contrasting color door frames, light switches, and handrails',
      'Staff available to assist with navigation',
      'Edges of steps and curbs are clearly marked',
      'Dimmer switches or glare control available',
      'Consistent flooring with no sudden pattern changes',
    ],
    warnings: [
      'Higgh gloss floors creating glare',
      'Dim or uneven lighting in key areas',
      'Strobe or flashing lights present',
      'Patterned carpeting creating visual clutter',
      'Low lying furniture creating trip hazards',
    ],
  },
  hearing: {
    tier1: {
      q1: 'Can staff communicate without relying solely on verbal speech?',
      q2: 'Is written communication available (pen/paper, screen, or tablet)?',
    },
    tier2: {
      q1: 'Are visual information displays available (not audio only announcements)?',
      q2: 'Is the noise level low enough to communicate effectively?',
    },
    tier3: [
      'Hearing loop or induction loop (T-coil compatible) available',
      'Staff trained in American Sign Language',
      'Visual fire alarm system present',
      'Captioned video content where applicable',
      'Clear sightlines to speakers and displays from all seating',
      'Reserved seating near speakers or interpreters available',
      'Assistive listening devices available on request',
      'TTY or equivalent at service desk',
    ],
    warnings: [
      'Very loud background music or machinery noise',
      'Audio only announcements with no visual equivalent',
      'No written communication option available',
    ],
  },
  sensory: {
    tier1: {
      q1: 'Were you able to navigate the space without asking for help?',
      q2: 'Was the noise level manageable throughout your visit?',
    },
    tier2: {
      q1: 'Is the environment consistent and predictable with no sudden unexpected changes?',
      q2: 'Are staff patient and willing to assist without making you repeat your needs publicly?',
    },
    tier3: [
      'Quiet room or low stimulation area available',
      'Sensory friendly hours offered',
      'Simple and clearly worded menus or signage',
      'Fidget tools or sensory kits available',
      'Lighting is adjustable or dimmable',
      'Alternative quieter route through the space available',
      'Minimal strong scents or fragrances',
      'Noise reducing headphones available',
      'Pre-visit information available (website, photos, map)',
      'Accessible play area available',
    ],
    warnings: [
      'Very loud or unpredictable noise levels',
      'Strong scents or fragrances present',
      'Strobe or flashing lights present',
      'Crowded or overwhelming environment',
      'Background music cannot be reduced or turned off',
      'Noisy hand dryers in restrooms with no alternative',
    ],
  },
};

// ─── Score computation (mirrors backend) ────

function computeScore(
  t1q1: boolean | null, t1q2: boolean | null,
  t2q1: boolean | null, t2q2: boolean | null,
  features: string[], warnings: string[]
): number {
  // Blanks stay blank (only one yes needed to pass each tier)
  // 0 = cannot enter, 1 = accessible entry only, 2 = entry + core access
  const tier1 = t1q1 === true || t1q2 === true;
  if (!tier1) return 0;
  const tier2 = t2q1 === true || t2q2 === true;
  if (!tier2) return 1;
  const fc = features.length;
  const wc = warnings.length;
  if (fc < 2) return 2;
  // 5 = entry + core + 3+ features, no warnings
  if (fc >= 3 && wc === 0) return 5;
  //4 = entry + core + 2+ features
  if (fc >= 2 && wc === 0) return 4;
  return 3; // has features but also warnings
}

// ─── Single category form ─────

function CategoryForm({
  categoryKey,
  categoryLabel,
  onComplete,
}: {
  categoryKey: string;
  categoryLabel: string;
  onComplete: (data: CategoryResult) => void;
}) {
  const tier = TIERS[categoryKey];
  const [t1q1, setT1q1] = useState<boolean | null>(null);
  const [t1q2, setT1q2] = useState<boolean | null>(null);
  const [tier1Submitted, setTier1Submitted] = useState(false);
  const [t2q1, setT2q1] = useState<boolean | null>(null);
  const [t2q2, setT2q2] = useState<boolean | null>(null);
  const [tier2Submitted, setTier2Submitted] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const score = computeScore(t1q1, t1q2, t2q1, t2q2, selectedFeatures, selectedWarnings);

  const scoreColor = score >= 4 ? '#2E7D32' : score >= 3 ? '#E65100' : '#B71C1C';

  const toggleFeature = (f: string) =>
    setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const toggleWarning = (w: string) =>
    setSelectedWarnings(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);

  const YesNo = ({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      {[true, false].map(v => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          style={{
            padding: '6px 16px', borderRadius: '4px', border: '2px solid',
            borderColor: value === v ? '#00ACC1' : '#ddd',
            backgroundColor: value === v ? '#E0F7FA' : 'white',
            color: value === v ? '#006978' : '#666',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
            fontFamily: 'Poppins, Arial, sans-serif'
          }}
        >
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  );

  const handleComplete = () => {
    onComplete({
      category: categoryKey,
      tier1_q1: t1q1,
      tier1_q2: t1q2,
      tier2_q1: tier1Submitted ? t2q1 : null,
      tier2_q2: tier1Submitted ? t2q2 : null,
      tier3_features: selectedFeatures,
      warnings: selectedWarnings,
      comment,
      computed_score: score,
    });
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#006978', fontSize: '16px' }}>{categoryLabel}</h3>
        {(tier1Submitted) && (
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: scoreColor, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '14px'
          }}>
            {score}
          </div>
        )}
      </div>

      {/* Tier 1 */}
      <div style={{ backgroundColor: '#F0F4F3', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 'bold', color: '#00ACC1', textTransform: 'uppercase' }}>
          Tier 1: Entry Access
        </p>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#333' }}>{tier.tier1.q1}</p>
          <YesNo value={t1q1} onChange={setT1q1} />
        </div>
        {!(categoryKey === 'mobility' && t1q1 === true) && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#333' }}>{tier.tier1.q2}</p>
            <YesNo value={t1q2} onChange={setT1q2} />
          </div>
        )}
        {!tier1Submitted && (t1q1 !== null || t1q2 !== null) && (
          <button
            onClick={() => setTier1Submitted(true)}
            style={{
              padding: '6px 16px', backgroundColor: '#00ACC1', color: 'white',
              border: 'none', borderRadius: '4px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 'bold', fontFamily: 'Poppins, Arial, sans-serif'
            }}
          >
            Next
          </button>
        )}
      </div>

      {/* Tier 2 (shown after Tier 1 answered) */}
      {tier1Submitted && (
        <div style={{ backgroundColor: '#F0F4F3', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 'bold', color: '#00ACC1', textTransform: 'uppercase' }}>
            Tier 2: Core Access
          </p>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#333' }}>{tier.tier2.q1}</p>
            <YesNo value={t2q1} onChange={setT2q1} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#333' }}>{tier.tier2.q2}</p>
            <YesNo value={t2q2} onChange={setT2q2} />
          </div>
          {!tier2Submitted && (t2q1 !== null || t2q2 !== null) && (
            <button
              onClick={() => setTier2Submitted(true)}
              style={{
                padding: '6px 16px', backgroundColor: '#00ACC1', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 'bold', fontFamily: 'Poppins, Arial, sans-serif'
              }}
            >
              Next
            </button>
          )}
        </div>
      )}

      {/* Tier 3 (shown after Tier 2 answered) */}
      {tier2Submitted && (
        <div style={{ backgroundColor: '#F0F4F3', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 'bold', color: '#00ACC1', textTransform: 'uppercase' }}>
            Tier 3: Additional Features (select all that apply)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {tier.tier3.map(feature => (
              <button
                key={feature}
                onClick={() => toggleFeature(feature)}
                style={{
                  padding: '4px 10px', borderRadius: '16px', border: '1px solid',
                  borderColor: selectedFeatures.includes(feature) ? '#00ACC1' : '#ddd',
                  backgroundColor: selectedFeatures.includes(feature) ? '#E0F7FA' : 'white',
                  color: selectedFeatures.includes(feature) ? '#006978' : '#555',
                  cursor: 'pointer', fontSize: '12px',
                  fontFamily: 'Poppins, Arial, sans-serif'
                }}
              >
                {feature}
              </button>
            ))}
          </div>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 'bold', color: '#E65100', textTransform: 'uppercase' }}>
            Warnings (select all that apply)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {tier.warnings.map(warning => (
              <button
                key={warning}
                onClick={() => toggleWarning(warning)}
                style={{
                  padding: '4px 10px', borderRadius: '16px', border: '1px solid',
                  borderColor: selectedWarnings.includes(warning) ? '#E65100' : '#ddd',
                  backgroundColor: selectedWarnings.includes(warning) ? '#FFF3E0' : 'white',
                  color: selectedWarnings.includes(warning) ? '#E65100' : '#555',
                  cursor: 'pointer', fontSize: '12px',
                  fontFamily: 'Poppins, Arial, sans-serif'
                }}
              >
                {warning}
              </button>
            ))}
          </div>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#333', fontWeight: 'bold' }}>
              Additional comments (optional)
            </p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share anything else about your experience..."
              rows={2}
              style={{
                width: '100%', padding: '8px', borderRadius: '4px',
                border: '1px solid #ddd', boxSizing: 'border-box' as const,
                fontFamily: 'Poppins, Arial, sans-serif', fontSize: '13px'
              }}
            />
          </div>
        </div>
      )}

      {/* Score preview and done button */}
      {tier1Submitted && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: '#666' }}>
            Computed score: <strong style={{ color: scoreColor }}>{score}/5</strong>
          </div>
          <button
            onClick={handleComplete}
            style={{
              padding: '8px 20px', backgroundColor: '#2E7D32', color: 'white',
              border: 'none', borderRadius: '4px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '13px', fontFamily: 'Poppins, Arial, sans-serif'
            }}
          >
            Save {categoryLabel}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Types ────

interface CategoryResult {
  category: string;
  tier1_q1: boolean | null;
  tier1_q2: boolean | null;
  tier2_q1: boolean | null;
  tier2_q2: boolean | null;
  tier3_features: string[];
  warnings: string[];
  comment: string;
  computed_score: number;
}

// ─── Main ReviewForm ────

export function ReviewForm({ businessId, businessName, onClose, onSubmitted, userProfile: initialProfile }: ReviewFormProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(initialProfile);

  // Find the user profile if not provided or is incomplete
  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/users/' + user.uid);
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (_e) {}
    };
    fetchProfile();
  }, []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [completedCategories, setCompletedCategories] = useState<CategoryResult[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'review' | 'done'>('select');

  // Determine which categories to show based on user profile
  const disabilityKeys = (userProfile?.disability_categories || [])
    .map((c: string) => c.toLowerCase().replace('/', '_').replace(' ', '_'))
    .map((c: string) => c === 'cognitive_sensory' ? 'sensory' : c);

  const hasDisabilityOrCaregiver = userProfile?.identifies_as_disabled || userProfile?.is_caregiver;
  const hasOther = (userProfile?.disability_categories || []).includes('Other');
  const noDisability = userProfile && !userProfile.identifies_as_disabled && !userProfile.is_caregiver;

  // Determine which categories are available
  // - Disability/caregiver with specific categories: only those categories
  // - Disability/caregiver with Other: all categories
  // - No disability: mobility first, others offered after
  // - No profile yet: all categories
  const availableCategories = !userProfile || hasOther || !hasDisabilityOrCaregiver
    ? CATEGORIES
    : CATEGORIES.filter(c => disabilityKeys.includes(c.key) || c.key === 'mobility');

  //Order: disability categories first, then mobility, then others
  const orderedCategories = [...availableCategories].sort((a, b) => {
    const aIsDisability = disabilityKeys.includes(a.key);
    const bIsDisability = disabilityKeys.includes(b.key);
    if (aIsDisability && !bIsDisability) return -1;
    if (!aIsDisability && bIsDisability) return 1;
    if (a.key === 'mobility') return -1;
    if (b.key === 'mobility') return 1;
    return 0;
  });

  // For users with no disability (show mobility first, offer others after completing)
  const [unlockedCategories, setUnlockedCategories] = useState<string[]>(
    noDisability ? ['mobility'] : orderedCategories.map(c => c.key)
  );

  const toggleCategory = (key: string) => {
    setSelectedCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleCategoryComplete = (result: CategoryResult) => {
    setCompletedCategories(prev => {
      const existing = prev.findIndex(r => r.category === result.category);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = result;
        return updated;
      }
      return [...prev, result];
    });
    // Unlock all categories for non-disabled users after completing mobility
    // If the user has no disability and they complete the mobility category, unlock all categories
    if (noDisability && result.category === 'mobility') {
      setUnlockedCategories(CATEGORIES.map(c => c.key));
    }
    setActiveCategory(null);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) { setError('You must be logged in to submit a review.'); return; }
    if (completedCategories.length === 0) { setError('Please complete at least one category.'); return; }

    setSubmitting(true);
    setError(null);

    try {
      // Save each category's feature data
      for (const cat of completedCategories) {
        await fetch((import.meta.env.VITE_API_URL || '') + '/api/review-features', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            firebase_uid: user.uid,
            category: cat.category,
            tier1_q1: cat.tier1_q1,
            tier1_q2: cat.tier1_q2,
            tier2_q1: cat.tier2_q1,
            tier2_q2: cat.tier2_q2,
            tier3_features: cat.tier3_features,
            warnings: cat.warnings,
          })
        });
      }

      // Also save a legacy review record for backward compatibility
      const mobilityResult = completedCategories.find(c => c.category === 'mobility');
      const visionResult = completedCategories.find(c => c.category === 'vision');
      const hearingResult = completedCategories.find(c => c.category === 'hearing');
      const sensoryResult = completedCategories.find(c => c.category === 'sensory');
      const comment = completedCategories.map(c => c.comment).filter(Boolean).join(' | ');

      await fetch((import.meta.env.VITE_API_URL || '') + '/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          firebase_uid: user.uid,
          mobility_score: mobilityResult?.computed_score || null,
          vision_score: visionResult?.computed_score || null,
          hearing_score: hearingResult?.computed_score || null,
          sensory_score: sensoryResult?.computed_score || null,
          service_score: null,
          restroom_score: null,
          parking_score: null,
          comment,
          tags: completedCategories.flatMap(c => [...c.tier3_features, ...c.warnings])
        })
      });

      setStep('done');
      setTimeout(() => { onSubmitted(); onClose(); }, 1500);
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
        padding: '24px', width: '560px', maxWidth: '90vw',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', color: '#00ACC1', fontSize: '18px' }}>Share Your Experience at</h2>
            <p style={{ margin: '0 0 4px', color: '#006978', fontSize: '18px' }}>{businessName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' }}>x</button>
        </div>

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '18px', color: '#2E7D32', fontWeight: 'bold' }}>Thank you for your review!</p>
            <p style={{ color: '#666', fontSize: '14px' }}>Your experience helps others in the community.</p>
          </div>
        )}

        {step === 'select' && (
          <>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#444' }}>
              Select the accessibility categories you want to review:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {orderedCategories.map(cat => {
                const isDisabilityMatch = disabilityKeys.includes(cat.key);
                const isLocked = noDisability && !unlockedCategories.includes(cat.key);
                const isSelected = selectedCategories.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    onClick={() => !isLocked && toggleCategory(cat.key)}
                    style={{
                      padding: '12px 16px', borderRadius: '6px', border: '2px solid',
                      borderColor: isSelected ? '#00ACC1' : isDisabilityMatch ? '#F06292' : '#ddd',
                      backgroundColor: isSelected ? '#E0F7FA' : isLocked ? '#f5f5f5' : 'white',
                      color: isSelected ? '#006978' : isLocked ? '#aaa' : '#333',
                      cursor: isLocked ? 'not-allowed' : 'pointer', textAlign: 'left',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      fontWeight: isDisabilityMatch ? 'bold' : 'normal',
                      fontSize: '14px', opacity: isLocked ? 0.6 : 1
                    }}
                  >
                    {cat.label}
                    {isDisabilityMatch && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', color: '#F06292' }}>
                        Your disability category
                      </span>
                    )}
                    {isLocked && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', color: '#aaa' }}>
                        Complete Mobility first to unlock
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                if (selectedCategories.length === 0) {
                  setError('Please select at least one category.');
                  return;
                }
                setActiveCategory(selectedCategories[0]);
                setStep('review');
              }}
              disabled={selectedCategories.length === 0}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#00ACC1', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '15px', fontFamily: 'Poppins, Arial, sans-serif',
                opacity: selectedCategories.length === 0 ? 0.5 : 1
              }}
            >
              Start Review
            </button>
            {error && <p style={{ color: '#B71C1C', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
          </>
        )}

        {step === 'review' && (
          <>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {selectedCategories.map(key => {
                const cat = CATEGORIES.find(c => c.key === key)!;
                const isDone = completedCategories.some(c => c.category === key);
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    style={{
                      padding: '6px 12px', borderRadius: '16px', border: '2px solid',
                      borderColor: isActive ? '#00ACC1' : isDone ? '#2E7D32' : '#ddd',
                      backgroundColor: isActive ? '#E0F7FA' : isDone ? '#E8F5E9' : 'white',
                      color: isActive ? '#006978' : isDone ? '#2E7D32' : '#666',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
                      fontFamily: 'Poppins, Arial, sans-serif'
                    }}
                  >
                    {isDone ? '✓ ' : ''}{cat.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Active category form */}
            {activeCategory && (
              <CategoryForm
                key={activeCategory}
                categoryKey={activeCategory}
                categoryLabel={CATEGORIES.find(c => c.key === activeCategory)!.label}
                onComplete={handleCategoryComplete}
              />
            )}

            {/* Progress and submit */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px' }}>
              {noDisability && completedCategories.some(c => c.category === 'mobility') && unlockedCategories.length > 1 && (
                <div style={{ backgroundColor: '#E0F7FA', borderRadius: '6px', padding: '10px 14px', marginBottom: '10px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#006978', fontWeight: 'bold' }}>
                    Want to help more?
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#444' }}>
                    Your observations on other accessibility features are still valuable even if you don't have that disability yourself.
                  </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CATEGORIES.filter(c => c.key !== 'mobility' && !selectedCategories.includes(c.key)).map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setSelectedCategories(prev => [...prev, cat.key]);
                        setActiveCategory(cat.key);
                      }}
                      style={{
                        padding: '6px 14px', borderRadius: '16px', border: '2px solid #00ACC1',
                        backgroundColor: 'white', color: '#006978',
                        cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
                        fontFamily: 'Poppins, Arial, sans-serif'
                      }}
                    >
                      + {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

              {error && <p style={{ color: '#B71C1C', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting || completedCategories.length === 0}
                style={{
                  width: '100%', padding: '12px', backgroundColor: '#2E7D32', color: 'white',
                  border: 'none', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold', fontSize: '15px', fontFamily: 'Poppins, Arial, sans-serif',
                  opacity: submitting || completedCategories.length === 0 ? 0.6 : 1
                }}
              >
                {submitting ? 'Submitting...' : `Submit Review (${completedCategories.length} categor${completedCategories.length === 1 ? 'y' : 'ies'})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
