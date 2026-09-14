import { useState } from 'react';
import { Logo } from './Logo';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

const DISABILITY_CATEGORIES = ['Mobility', 'Vision', 'Hearing', 'Cognitive/Sensory', 'Other'];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [identityAnswer, setIdentityAnswer] = useState<string | null>(null);
  const [disabilityCategories, setDisabilityCategories] = useState<string[]>([]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    display: 'block',
    marginBottom: '10px',
    padding: '10px',
    width: '100%',
    border: '1px solid #00ACC1',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    fontFamily: 'Poppins, Arial, sans-serif'
  };

  const toggleCategory = (cat: string) => {
    setDisabilityCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const showCategoryQuestion = identityAnswer === 'yes' || identityAnswer === 'caregiver';
  const categoryQuestion = identityAnswer === 'caregiver'
    ? 'Do you support a person with a disability that fits into one or more of these categories?'
    : 'Does your disability fit into one or more of these categories?';

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!firstName || !lastName || !username) {
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }
        if (username.length < 3) {
          setError('Username must be at least 3 characters.');
          setLoading(false);
          return;
        }
        if (!identityAnswer) {
          setError('Please answer the disability identity question.');
          setLoading(false);
          return;
        }
        if (showCategoryQuestion && disabilityCategories.length === 0) {
          setError('Please select at least one disability category.');
          setLoading(false);
          return;
        }

        // Check username availability
        const usernameCheck = await fetch(
          (import.meta.env.VITE_API_URL || '') + '/api/users/username-check/' + encodeURIComponent(username)
        );
        const usernameData = await usernameCheck.json();
        if (!usernameData.available) {
          setError('That username is already taken. Please choose a different one.');
          setLoading(false);
          return;
        }

        // Create Firebase account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });

        // Save to database
        const userRes = await fetch((import.meta.env.VITE_API_URL || '') + '/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebase_uid: userCredential.user.uid,
            email,
            display_name: username,
            first_name: firstName,
            last_name: lastName,
            username,
            identifies_as_disabled: identityAnswer === 'yes',
            is_caregiver: identityAnswer === 'caregiver',
            disability_categories: disabilityCategories.length > 0 ? disabilityCategories : null,
          })
        });

        if (!userRes.ok) {
          const userErr = await userRes.json();
          const errMsg = userErr.error || 'Failed to create account. Please try again.';
          try { await userCredential.user.delete(); } catch (_e) {}
          setIsSignUp(true);
          setError(errMsg);
          setLoading(false);
          return;
        }

      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      if (msg.includes('email-already-in-use')) setError('An account with that email already exists.');
      else if (msg.includes('weak-password')) setError('Password must be at least 6 characters.');
      else if (msg.includes('invalid-credential')) setError('Incorrect email or password.');
      else if (msg.includes('invalid-email')) setError('Please enter a valid email address.');
      else setError(msg);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px', fontFamily: 'Poppins, Arial, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
        <Logo size={100} />
      </div>
      <h1 style={{ fontSize: '28px', color: '#00ACC1', marginBottom: '8px', textAlign: 'center' }}>Accessibility Tracker</h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', textAlign: 'center' }}>
        Rate, review, and discover accessible businesses near you
      </p>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#006978' }}>
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>

        {error && (
          <p style={{ color: '#B71C1C', backgroundColor: '#FFEBEE', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', marginBottom: '12px' }}>
            {error}
          </p>
        )}

        {isSignUp && (
          <>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="First name *" value={firstName}
                onChange={e => setFirstName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <input type="text" placeholder="Last name *" value={lastName}
                onChange={e => setLastName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input type="text" placeholder="Username * (shown on your reviews)"
              value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
              style={inputStyle} />
          </>
        )}

        <input type="email" placeholder="Email *" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password *" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputStyle} />

        {isSignUp && (
          <>
            {/* Identity question */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#333', fontWeight: 'bold', marginBottom: '8px' }}>
                Do you identify as: * <span style={{ color: '#999', fontWeight: 'normal' }}>(required)</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { value: 'yes', label: 'A person with a disability' },
                  { value: 'no', label: 'I do not have a disability' },
                  { value: 'caregiver', label: 'A caregiver, support worker, or personal care assistant' },
                  { value: 'prefer_not', label: 'Prefer not to say' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setIdentityAnswer(opt.value);
                      setDisabilityCategories([]);
                    }}
                    style={{
                      padding: '10px 14px', borderRadius: '4px', border: '2px solid',
                      borderColor: identityAnswer === opt.value ? '#00ACC1' : '#ddd',
                      backgroundColor: identityAnswer === opt.value ? '#E0F7FA' : 'white',
                      color: identityAnswer === opt.value ? '#006978' : '#444',
                      cursor: 'pointer', textAlign: 'left', fontSize: '13px',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      fontWeight: identityAnswer === opt.value ? 'bold' : 'normal'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Disability category question */}
            {showCategoryQuestion && (
              <div style={{ marginBottom: '16px', backgroundColor: '#E0F7FA', borderRadius: '6px', padding: '14px' }}>
                <p style={{ fontSize: '13px', color: '#006978', fontWeight: 'bold', marginBottom: '8px' }}>
                  {categoryQuestion} * <span style={{ color: '#999', fontWeight: 'normal' }}>(select all that apply)</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DISABILITY_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      style={{
                        padding: '6px 14px', borderRadius: '16px', border: '2px solid',
                        borderColor: disabilityCategories.includes(cat) ? '#00ACC1' : '#aaa',
                        backgroundColor: disabilityCategories.includes(cat) ? '#00ACC1' : 'white',
                        color: disabilityCategories.includes(cat) ? 'white' : '#444',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
                        fontFamily: 'Poppins, Arial, sans-serif'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', backgroundColor: '#00ACC1', color: 'white',
            border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold', fontSize: '15px', marginBottom: '10px',
            fontFamily: 'Poppins, Arial, sans-serif', opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
          style={{
            width: '100%', padding: '10px', backgroundColor: 'transparent',
            color: '#00ACC1', border: '1px solid #00ACC1', borderRadius: '4px',
            cursor: 'pointer', fontSize: '13px', fontFamily: 'Poppins, Arial, sans-serif'
          }}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>

      {isSignUp && (
        <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginTop: '12px' }}>
          * Required fields. Your email is never shown publicly.
        </p>
      )}
    </div>
  );
}
