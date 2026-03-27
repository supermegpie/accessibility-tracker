import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { LoginPage } from './components/LoginPage';
import { MapView } from './components/MapView';
import { CityDashboard } from './components/CityDashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  if (authLoading) return <p style={{ padding: '20px' }}>Loading...</p>;
  if (!user) return <LoginPage />;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1E4D8C', color: 'white',
        padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 'bold' }}>
          ♿ Accessibility Tracker
        </h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowDashboard(true)}
            style={{
              padding: '6px 12px', backgroundColor: 'white',
              color: '#1E4D8C', border: 'none', borderRadius: '4px',
              cursor: 'pointer', fontWeight: 'bold',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => auth.signOut()}
            style={{
              padding: '6px 12px', backgroundColor: 'transparent',
              color: 'white', border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '4px', cursor: 'pointer',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '12px', maxWidth: '1200px', margin: '0 auto' }}>
        <MapView />
      </div>

      {showDashboard && <CityDashboard onClose={() => setShowDashboard(false)} />}
    </div>
  );
}

export default App;
