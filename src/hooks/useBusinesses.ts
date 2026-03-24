import { useState, useEffect } from 'react';

export interface Business {
  id: number;
  google_place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  business_type: string;
  overall_accessibility_score: number;
}

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setBusinesses(data);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return { businesses, loading, error, refetch: fetchBusinesses };
}
