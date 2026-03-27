import { useState, useEffect } from 'react';

interface CityStats {
  overall: {
    total_businesses: string;
    avg_overall_score: string;
    avg_mobility: string;
    avg_sensory: string;
    avg_service: string;
    avg_restroom: string;
    avg_parking: string;
    total_reviews: string;
  };
  byType: {
    business_type: string;
    total_businesses: string;
    avg_overall_score: string;
    total_reviews: string;
  }[];
  topBusinesses: {
    id: number;
    name: string;
    address: string;
    business_type: string;
    overall_accessibility_score: string;
  }[];
}

function ScoreCircle({ score, label }: { score: string | null; label: string }) {
  const num = score ? Number(score) : 0;
  const color = num >= 4 ? '#27AE60' : num >= 3 ? '#F39C12' : num > 0 ? '#E74C3C' : '#999';
  return (
    <div style={{ textAlign: 'center', padding: '8px' }}>
      <div style={{
        width: '60px', height: '60px', borderRadius: '50%',
        backgroundColor: color, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontWeight: 'bold', margin: '0 auto 6px'
      }}>
        {num > 0 ? num.toFixed(1) : 'N/A'}
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>{label}</div>
    </div>
  );
}

interface CityDashboardProps {
  onClose: () => void;
}

export function CityDashboard({ onClose }: CityDashboardProps) {
  const [stats, setStats] = useState<CityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cities/stats')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px',
        padding: '24px', width: '620px', maxWidth: '90vw',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', color: '#1E4D8C' }}>City Accessibility Dashboard</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Community-powered accessibility data</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>

        {loading && <p style={{ color: '#666' }}>Loading stats...</p>}

        {stats && (
          <>
            {/* Overall Stats */}
            <div style={{
              backgroundColor: '#f8f9fa', borderRadius: '8px',
              padding: '16px', marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E4D8C' }}>
                    {stats.overall.total_businesses}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Businesses Tracked</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27AE60' }}>
                    {stats.overall.avg_overall_score ? Number(stats.overall.avg_overall_score).toFixed(1) : 'N/A'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Avg Accessibility Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E4D8C' }}>
                    {stats.overall.total_reviews}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Community Reviews</div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <ScoreCircle score={stats.overall.avg_mobility} label="Mobility" />
                <ScoreCircle score={stats.overall.avg_sensory} label="Sensory" />
                <ScoreCircle score={stats.overall.avg_service} label="Service" />
                <ScoreCircle score={stats.overall.avg_restroom} label="Restrooms" />
                <ScoreCircle score={stats.overall.avg_parking} label="Parking" />
              </div>
            </div>

            {/* Top Businesses */}
            {stats.topBusinesses.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#1E4D8C' }}>
                  Top Rated Businesses
                </h3>
                {stats.topBusinesses.map((business, index) => (
                  <div key={business.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px', backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                    borderRadius: '4px', marginBottom: '4px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{business.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{business.address}</div>
                    </div>
                    <div style={{
                      backgroundColor: Number(business.overall_accessibility_score) >= 4 ? '#27AE60' : '#F39C12',
                      color: 'white', padding: '4px 10px', borderRadius: '12px',
                      fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap'
                    }}>
                      {Number(business.overall_accessibility_score).toFixed(1)}/5
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* By Business Type */}
            {stats.byType.length > 0 && (
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#1E4D8C' }}>
                  By Business Type
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1E4D8C', color: 'white' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Businesses</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Avg Score</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Reviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byType.map((row, index) => (
                      <tr key={row.business_type} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                        <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{row.business_type}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{row.total_businesses}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          {row.avg_overall_score ? Number(row.avg_overall_score).toFixed(1) : 'Not rated'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{row.total_reviews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
