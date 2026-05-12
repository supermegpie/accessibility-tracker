import { useState } from 'react';
import { Logo } from './Logo';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'Poppins, Arial, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
        <Logo size={100} />
      </div>
      <h1 style={{ fontSize: '32px', color: '#00ACC1', marginBottom: '8px' }}>Accessibility Tracker</h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Rate, review, and discover accessible businesses near you</p>
      <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%', border: '1px solid #00ACC1' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%', border: '1px solid #00ACC1' }}
        />
        <button
          onClick={handleSubmit}
          style={{ padding: '10px 20px', marginRight: '10px', color: '#F06292', border: '1px solid #00ACC1'}}
        >
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ padding: '10px 20px', color: '#F06292', border: '1px solid #00ACC1' }}
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
}
