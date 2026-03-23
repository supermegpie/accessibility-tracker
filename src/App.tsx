import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { LoginPage } from './components/LoginPage';
import { useBusinesses } from './hooks/useBusinesses';
import { MapView } from './components/MapView';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { businesses, loading, error } = useBusinesses();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  if (authLoading) return <p>Loading...</p>;
  if (!user) return <LoginPage />;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Arial' }}>
      <h1>Accessibility Tracker</h1>
      <p>Welcome, {user.email}!</p>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      <MapView />
      {loading && <p>Loading businesses...</p>}
      {error && <p>Error: {error}</p>}
      {businesses.length === 0 && <p>No businesses yet.</p>}
    </div>
  );
}

export default App;
