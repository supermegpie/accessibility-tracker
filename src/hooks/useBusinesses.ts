import { useState, useEffect } from 'react';

// Define the shape of a Business using TypeScript
interface Business {
  id: number;
  name: string;
  address: string;
  overall_accessibility_score: number;
}

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  fetch('/api/businesses')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => { setBusinesses(data); setLoading(false); })
    .catch(err => { setError(err.message); setLoading(false); });
}, []);

  return { businesses, loading, error };
}