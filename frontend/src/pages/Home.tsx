import React, { useEffect, useState } from 'react';
import { getTrending } from '../api/client';
import MovieCard from '../components/MovieCard';
import { Play, Info } from 'lucide-react';

const Home: React.FC = () => {
    const [trending, setTrending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const data = await getTrending();
                setTrending(data);
            } catch (err) {
                console.error('Failed to fetch trending:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    const featured = trending.length > 0 ? trending[0] : null;

    return (
        <div className="min-h-screen pb-24">
            {/* Hero Section */}
            <section className="relative h-[95vh] w-full overflow-hidden">
                {featured ? (
                    <>
                        <img
                            src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
                            alt={featured.title || featured.name}
                            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />

                        <div className="absolute bottom-24 left-12 md:left-24 max-w-3xl space-y-8 animate-slide-up">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Trending #1</span>
                                    <span className="text-text-muted text-sm font-medium">Available in 4K Ultra HD</span>
                                </div>
                                <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-glow leading-tight">
                                    {featured.title || featured.name}
                                </h1>
                            </div>

                            <p className="text-xl text-text-muted max-w-2xl leading-relaxed line-clamp-3 font-light">
                                {featured.overview}
                            </p>

                            <div className="flex items-center gap-6">
                                <button className="btn-primary group !py-4 !px-10 text-xl shadow-glow">
                                    <Play className="fill-white group-hover:scale-125 transition-transform" size={28} />
                                    Watch Now
                                </button>
                                <button className="btn-secondary !py-4 !px-10 text-xl">
                                    <Info size={28} />
                                    Details
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full bg-surface-opaque animate-pulse" />
                )}
            </section>

            {/* Content Rows */}
            <div className="px-12 md:px-24 -mt-12 relative z-10 space-y-16">
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold tracking-tight text-glow">Trending Now</h2>
                            <p className="text-text-muted text-sm font-medium">The most popular content on Nexus today</p>
                        </div>
                        <a href="/trending" className="group flex items-center gap-2 text-sm text-primary font-bold hover:text-white transition-colors">
                            View All Collection
                            <span className="w-8 h-[2px] bg-primary group-hover:w-12 transition-all" />
                        </a>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
                        {loading ? (
                            Array(10).fill(0).map((_, i) => (
                                <div key={i} className="min-w-[250px] aspect-[2/3] rounded-2xl bg-white/5 animate-pulse" />
                            ))
                        ) : (
                            trending.slice(1).map((item) => (
                                <div key={item.id} className="min-w-[250px] md:min-w-[280px]">
                                    <MovieCard
                                        id={item.id}
                                        title={item.title || item.name}
                                        poster={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        rating={item.vote_average}
                                        year={item.release_date || item.first_air_date}
                                        type={item.media_type}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold tracking-tight text-glow">Featured Movies</h2>
                            <p className="text-text-muted text-sm font-medium">Hand-picked cinematic masterpieces</p>
                        </div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
                        {loading ? (
                            Array(10).fill(0).map((_, i) => (
                                <div key={i} className="min-w-[250px] aspect-[2/3] rounded-2xl bg-white/5 animate-pulse" />
                            ))
                        ) : (
                            trending.slice(0, 10).reverse().map((item) => (
                                <div key={item.id} className="min-w-[250px] md:min-w-[280px]">
                                    <MovieCard
                                        id={item.id}
                                        title={item.title || item.name}
                                        poster={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        rating={item.vote_average}
                                        year={item.release_date || item.first_air_date}
                                        type={item.media_type}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
