import { useState, useCallback } from 'react';
import { getStreamLinks } from '../api/client';

export const useStreams = (type: string, id: string) => {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreams = useCallback(async (season?: number, episode?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStreamLinks(type, id, season, episode);
      setStreams(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch streams');
      return [];
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  return { streams, loading, error, fetchStreams };
};
