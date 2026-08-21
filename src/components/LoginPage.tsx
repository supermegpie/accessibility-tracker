import { useState } from 'react';
import { Logo } from './Logo';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [identifiesAsDisabled, setIdentifiesAsDisabled] = useState<boolean | null>(null);
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

        // Create Firebase account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Set display name in Firebase
        await updateProfile(userCredential.user, {
          displayName: username
        });

        // Save full profile to our database
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
            identifies_as_disabled: identifiesAsDisabled
          })
        });

        if (!userRes.ok) {
          const userErr = await userRes.json();
          // Delete the Firebase account if our DB save failed
          await userCredential.user.delete();
          setError(userErr.error || 'Failed to create account. Please try again.');
          setLoading(false);
          return;
        }

      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      // Make Firebase error messages friendlier
      if (msg.includes('email-already-in-use')) setError('An account with that email already exists.');
      else if (msg.includes('weak-password')) setError('Password must be at least 6 characters.');
      else if (msg.includes('invalid-credential')) setError('Incorrect email or password.');
      else if (msg.includes('invalid-email')) setError('Please enter a valid email address.');
      else setError(msg);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '0 16px', fontFamily: 'Poppins, Arial, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
        <Logo size={100} />
      </div>
      <h1 style={{ fontSize: '32px', color: '#00ACC1', marginBottom: '8px', textAlign: 'center' }}>Accessibility Tracker</h1>
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
              <input
                type="text"
                placeholder="First name *"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="text"
                placeholder="Last name *"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <input
              type="text"
              placeholder="Username * (shown on your reviews)"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
              style={inputStyle}
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password *"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={inputStyle}
        />

        {isSignUp && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#444', marginBottom: '8px' }}>
              Do you identify as a person with a disability? <span style={{ color: '#999' }}>(optional)</span>
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIdentifiesAsDisabled(true)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '4px', border: '2px solid',
                  borderColor: identifiesAsDisabled === true ? '#00ACC1' : '#ddd',
                  backgroundColor: identifiesAsDisabled === true ? '#E0F7FA' : 'white',
                  color: identifiesAsDisabled === true ? '#006978' : '#666',
                  cursor: 'pointer', fontFamily: 'Poppins, Arial, sans-serif', fontSize: '13px', fontWeight: 'bold'
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setIdentifiesAsDisabled(false)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '4px', border: '2px solid',
                  borderColor: identifiesAsDisabled === false ? '#00ACC1' : '#ddd',
                  backgroundColor: identifiesAsDisabled === false ? '#E0F7FA' : 'white',
                  color: identifiesAsDisabled === false ? '#006978' : '#666',
                  cursor: 'pointer', fontFamily: 'Poppins, Arial, sans-serif', fontSize: '13px', fontWeight: 'bold'
                }}
              >
                No
              </button>
              <button
                onClick={() => setIdentifiesAsDisabled(null)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '4px', border: '2px solid',
                  borderColor: identifiesAsDisabled === null ? '#00ACC1' : '#ddd',
                  backgroundColor: identifiesAsDisabled === null ? '#E0F7FA' : 'white',
                  color: identifiesAsDisabled === null ? '#006978' : '#666',
                  cursor: 'pointer', fontFamily: 'Poppins, Arial, sans-serif', fontSize: '13px', fontWeight: 'bold'
                }}
              >
                Prefer not to say
              </button>
            </div>
          </div>
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
