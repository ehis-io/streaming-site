import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTrending = async () => {
  const { data } = await api.get('/movies/trending');
  return data.results || data;
};

export const searchMovies = async (query: string) => {
  const { data } = await api.get(`/movies/search`, { params: { q: query } });
  return data.results || data;
};

export const getDetails = async (type: string, id: string) => {
  const { data } = await api.get(`/${type === 'movie' ? 'movies' : 'tv'}/${id}`);
  return data;
};

export const getStreamLinks = async (type: string, id: string, season?: number, episode?: number) => {
  const url = type === 'tv' && season && episode 
    ? `/streams/${id}/${season}/${episode}`
    : `/streams/${id}`;
  const { data } = await api.get(url);
  return data;
};

export default api;
