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
  mobility_accessibility_score?: number;
  vision_accessibility_score?: number;
  hearing_accessibility_score?: number;
  sensory_accessibility_score?: number;
  verified_features_count?: number;
}

export function useBusinesses(minScore = 0, businessType = 'all', category = 'all') {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      const params = new URLSearchParams();
      if (minScore > 0) params.append('minScore', String(minScore));
      if (businessType !== 'all') params.append('businessType', businessType);
      if (category !== 'all') params.append('category', category);

      const baseUrl = import.meta.env.VITE_API_URL || '';
      const hasFilters = minScore > 0 || businessType !== 'all' || category !== 'all';
      const url = hasFilters
        ? `${baseUrl}/api/businesses/filter?${params.toString()}`
        : `${baseUrl}/api/businesses`;

      const response = await fetch(url);
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
  }, [minScore, businessType, category]);

  return { businesses, loading, error, refetch: fetchBusinesses };
}
