import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMovies } from '../api/client';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon } from 'lucide-react';

const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const data = await searchMovies(query);
                setResults(data);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="min-h-screen pt-32 pb-24 px-12 md:px-24 space-y-12 bg-background">
            <div className="space-y-4 animate-slide-up">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-10 bg-primary rounded-full shadow-glow" />
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-glow flex items-center gap-4">
                        Search Results
                    </h1>
                </div>
                <p className="text-xl text-text-muted font-light">
                    Exploration results for "<span className="text-white font-bold text-glow">{query}</span>"
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-8 animate-fade-in">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-primary/20 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <p className="text-xl text-text-muted font-medium tracking-widest uppercase animate-pulse">Searching the Nexus...</p>
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 animate-slide-up">
                    {results.map((item) => (
                        <MovieCard
                            key={item.id}
                            id={item.id}
                            title={item.title || item.name}
                            poster={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            rating={item.vote_average}
                            year={item.release_date || item.first_air_date}
                            type={item.media_type || 'movie'}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-fade-in">
                    <div className="relative">
                        <div className="text-9xl font-bold text-white/5 tracking-tighter select-none">NULL</div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <SearchIcon size={64} className="text-text-muted opacity-20" />
                        </div>
                    </div>
                    <div className="text-center space-y-4">
                        <p className="text-2xl text-text-muted font-light">The Nexus returned no matches for your query.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-secondary !py-3 !px-8"
                        >
                            Return to Discovery
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
