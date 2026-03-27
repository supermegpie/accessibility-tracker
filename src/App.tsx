import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { LoginPage } from './components/LoginPage';
import { useBusinesses } from './hooks/useBusinesses';
import { MapView } from './components/MapView';
import { CityDashboard } from './components/CityDashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { businesses, loading, error } = useBusinesses();
  const [showDashboard, setShowDashboard] = useState(false);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#1E4D8C' }}>Accessibility Tracker</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowDashboard(true)}
            style={{ padding: '8px 16px', backgroundColor: '#1E4D8C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            City Dashboard
          </button>
          <span style={{ color: '#666', fontSize: '14px' }}>{user.email}</span>
          <button onClick={() => auth.signOut()} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }}>
            Sign Out
        </button>
      </div>
    </div>
    <MapView />
    {showDashboard && <CityDashboard onClose={() => setShowDashboard(false)} />}
  </div>
  );
}

export default App;
