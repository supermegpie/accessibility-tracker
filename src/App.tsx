import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { LoginPage } from './components/LoginPage';
import { MapView } from './components/MapView';
import { CityDashboard } from './components/CityDashboard';
import { TripPlanner } from './components/TripPlanner';
import { About } from './components/About';
import { ElevatorInfo } from './components/ElevatorInfo';
import { DayPlanner } from './components/DayPlanner';
import { Footer } from './components/Footer';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentCity, setCurrentCity] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
    <div style={{ fontFamily: 'Poppins, Arial, sans-serif', minHeight: '200vh', backgroundColor: '#E0F7FA' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#00ACC1', color: 'white',
        padding: '18px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <img src="/logo.png" alt="Accessibility Tracker logo" style={{ height: "64px", width: "auto", objectFit: "contain" }} />
          <h1 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 'bold' }}>
            Accessibility Tracker
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '6px 12px',
              backgroundColor: location.pathname === '/' ? 'white' : 'transparent',
              color: location.pathname === '/' ? '#F06292' : 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}
            /* #F06292*/
          >
            Map
          </button>
          <button
            onClick={() => navigate('/trip-planner')}
            style={{
              padding: '6px 12px',
              backgroundColor: location.pathname === '/trip-planner' ? 'white' : 'transparent',
              color: location.pathname === '/trip-planner' ? '#F06292' : 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}
          >
            Trip Planner
          </button>
          <button
            onClick={() => setShowDashboard(true)}
            style={{
              padding: '6px 12px', 
              backgroundColor: showDashboard ? 'white' : 'transparent',
              color: showDashboard ? '#F06292' : 'white', 
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/day-planner')}
            style={{
              padding: '6px 12px',
              backgroundColor: location.pathname === '/day-planner' ? 'white' : 'transparent',
              color: location.pathname === '/day-planner' ? '#F06292' : 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}
          >
            Plan a Day
          </button>
          <button
            onClick={() => navigate('/elevators')}
            style={{
              padding: '6px 12px',
              backgroundColor: location.pathname === '/elevators' ? 'white' : 'transparent',
              color: location.pathname === '/elevators' ? '#F06292' : 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}
          >
            Elevators
          </button>
          <button
            onClick={() => navigate('/about')}
            style={{
              padding: '6px 12px',
              backgroundColor: location.pathname === '/about' ? 'white' : 'transparent',
              color: location.pathname === '/about' ? '#F06292' : 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}
          >
            About
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

      {/* Routes */}
      <div style={{ padding: '12px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<MapView onCitySearch={setCurrentCity} />} />
          <Route path="/trip-planner" element={<TripPlanner user={user} />} />
          <Route path="/trip-planner/share/:shareId" element={<TripPlanner user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/elevators" element={<ElevatorInfo />} />
          <Route path="/day-planner" element={<DayPlanner />} />
          <Route path="/day-planner/share/:shareId" element={<DayPlanner />} />
        </Routes>
      </div>

      {showDashboard && <CityDashboard onClose={() => setShowDashboard(false)} city={currentCity} />}
      <Footer />
    </div>
  );
}

export default App;
