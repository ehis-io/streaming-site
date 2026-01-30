import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetails } from '../api/client';
import { useStreams } from '../hooks/useStreams';
import Player from '../components/Player';
import { Play, Calendar, Clock, Star, ChevronLeft } from 'lucide-react';

const Details: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  const { streams, loading: streamsLoading, fetchStreams } = useStreams(type || 'movie', id || '');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const data = await getDetails(type || 'movie', id);
        setDetails(data);
      } catch (err) {
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handlePlay = async () => {
    if (selectedStream) {
      setSelectedStream(null);
      setTimeout(() => setSelectedStream(selectedStream), 0);
      return;
    }

    const fetchedStreams = await fetchStreams();
    if (fetchedStreams && fetchedStreams.length > 0) {
      setSelectedStream(fetchedStreams[0].url);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (!details) return <div className="pt-32 px-6 text-center text-text-muted">Content not found.</div>;

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Video Player Section - Now at the top */}
      {selectedStream && (
        <div className="pt-24 pb-12 bg-background">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-8 animate-slide-up">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 bg-primary rounded-full shadow-glow" />
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-glow">
                    Cinematic Player
                  </h2>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="glass p-3 hover:bg-white/10 transition-all rounded-2xl group"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="rounded-[32px] overflow-hidden shadow-2xl shadow-primary/20 border border-white/5 bg-surface-opaque p-1">
                <Player url={selectedStream} />
              </div>
            </div>

            <div className="space-y-6 p-8 md:p-12 glass rounded-[32px] border-white/5 shadow-inner">
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Streaming Options</h3>
                <p className="text-text-muted font-medium text-sm">Switch servers if you experience buffering</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {streams.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedStream(s.url)}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500 scale-100 active:scale-95 ${selectedStream === s.url
                      ? 'border-primary bg-primary/20 text-white shadow-lg shadow-primary/20'
                      : 'border-white/5 bg-white/5 text-text-muted hover:border-white/20 hover:bg-white/10'
                      }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full transition-colors ${selectedStream === s.url ? 'bg-primary animate-pulse' : 'bg-white/20 group-hover:bg-white/40'}`} />
                    <div className="text-left">
                      <div className="text-xs md:text-sm font-bold uppercase tracking-widest">Server {i + 1}</div>
                      <div className="text-xs opacity-60 font-medium hidden md:block">Quality: {s.quality || 'Ultra HD'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Backdrop */}
      <div className={`relative w-full overflow-hidden ${selectedStream ? 'h-[60vh]' : 'h-[85vh]'}`}>
        <img
          src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
          className="w-full h-full object-cover animate-fade-in scale-105"
          alt={details.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />

        {!selectedStream && (
          <button
            onClick={() => navigate(-1)}
            className="absolute top-28 left-12 glass p-4 hover:bg-white/10 transition-all z-10 rounded-2xl group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        )}

        <div className="absolute bottom-12 md:bottom-24 left-6 md:left-12 lg:left-24 right-6 md:right-12 flex flex-col md:flex-row gap-8 md:gap-16 items-end animate-slide-up">
          <div className="w-48 md:w-72 aspect-[2/3] rounded-3xl glass-card overflow-hidden hidden md:block shadow-2xl shadow-black/50 border-white/10">
            <img
              src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
              className="w-full h-full object-cover"
              alt={details.title}
            />
          </div>

          <div className="flex-1 space-y-4 md:space-y-8">
            <div className="flex flex-wrap gap-2 md:gap-3">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                {type === 'movie' ? 'Feature Film' : 'TV Series'}
              </span>
              {details.genres?.slice(0, 3).map((g: any) => (
                <span key={g.id} className="glass px-3 md:px-4 py-1 rounded-full text-xs font-semibold text-text-muted hover:text-white transition-colors cursor-default">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight text-glow leading-tight">
              {details.title || details.name}
            </h1>

            <div className="flex items-center gap-4 md:gap-8 text-text-muted font-semibold text-sm md:text-base">
              <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-400 px-3 md:px-4 py-1.5 rounded-xl border border-yellow-400/20">
                <Star size={16} className="fill-yellow-400" />
                {details.vote_average?.toFixed(1)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} strokeWidth={2.5} />
                {new Date(details.release_date || details.first_air_date).getFullYear()}
              </div>
              {details.runtime && (
                <div className="flex items-center gap-2">
                  <Clock size={16} strokeWidth={2.5} />
                  {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                </div>
              )}
            </div>

            <p className="text-base md:text-xl text-text-muted max-w-4xl leading-relaxed font-light line-clamp-2 md:line-clamp-3">
              {details.overview}
            </p>

            <div className="flex items-center gap-4 md:gap-6 pt-2 md:pt-4">
              <button
                onClick={handlePlay}
                disabled={streamsLoading}
                className="btn-primary !py-3 md:!py-5 !px-8 md:!px-12 text-lg md:text-2xl group disabled:opacity-50"
              >
                {streamsLoading ? (
                  <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="fill-white group-hover:scale-125 transition-all" size={24} />
                )}
                {selectedStream ? 'Restart' : 'Begin Streaming'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
