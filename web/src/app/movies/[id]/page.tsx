'use client';

import { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import styles from './page.module.css';
import { Content, Provider } from '@/types';
import { usePrefetch } from '@/hooks/usePrefetch';
import { useStreams } from '@/hooks/useStreams';

export default function MovieDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [movie, setMovie] = useState<Content | null>(null);
    const [recommendations, setRecommendations] = useState<Content[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const { prefetch } = usePrefetch();

    const { links: streamLinks } = useStreams(useMemo(() => ({
        id: params.id,
        type: 'sub',
        mediaType: 'movie'
    }), [params.id]));

    // Map StreamLinks to Providers
    const dynamicProviders = useMemo(() => {
        return streamLinks.map((link, index) => ({
            id: `dynamic-${index}`,
            name: link.provider || 'Auto',
            embedUrl: link.url
        }));
    }, [streamLinks]);

    useEffect(() => {
        setMovie(null);
        setRecommendations([]);
        setSelectedProvider(null);

        // Fetch movie details
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movies/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setMovie(data);
            })
            .catch(err => console.error('Movie fetch error:', err));

        // Fetch recommendations
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movies/${params.id}/recommendations`)
            .then(res => res.json())
            .then(data => {
                const results = data.results || [];
                setRecommendations(results);
                if (results.length > 0) {
                    prefetch(results, 'movie');
                }
            })
            .catch(err => console.error('Recommendations fetch error:', err));
    }, [params.id, prefetch]);

    const allProviders = useMemo(() => {
        const local = movie?.localProviders || [];
        const dynamic = dynamicProviders;

        // Deduplicate providers
        const seen = new Set<string>();
        return [...local, ...dynamic].filter(p => {
            if (seen.has(String(p.id))) return false;
            seen.add(String(p.id));
            return true;
        });
    }, [movie, dynamicProviders]);

    useEffect(() => {
        if (!selectedProvider && allProviders.length > 0) {
            setSelectedProvider(allProviders[0]);
        }
    }, [allProviders, selectedProvider]);

    // VidLink Event Listeners
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://vidlink.pro') return;

            if (event.data?.type === 'MEDIA_DATA') {
                const mediaData = event.data.data;
                localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!movie) return <Spinner />;

    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : '';

    return (
        <div className={styles.container}>
            <div
                className={styles.backdrop}
                style={{ backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none' }}
            >
                <div className={styles.backdropOverlay} />
            </div>

            <div className={styles.content}>
                <Link href="/" className={styles.backBtn}>
                    ← Back to Catalog
                </Link>

                <div className={styles.playerSection}>
                    {selectedProvider ? (
                        <div className={styles.playerWrapper}>
                            <iframe
                                src={selectedProvider.embedUrl}
                                allowFullScreen
                                className={styles.iframe}
                                title="Video Player"
                            />
                        </div>
                    ) : (
                        <div className={styles.noPlayer}>
                            <div className={styles.noPlayerContent}>
                                <p>Resolving stream links...</p>
                                <Spinner />
                            </div>
                        </div>
                    )}

                    <div className={styles.selectorSection}>
                        <h3 className={styles.selectorTitle}>Select Server</h3>
                        <div className={styles.providerSelector}>
                            <select
                                className={styles.select}
                                value={selectedProvider?.id || ''}
                                onChange={(e) => {
                                    const provider = allProviders.find(p => p.id === e.target.value);
                                    if (provider) setSelectedProvider(provider);
                                }}
                            >
                                <option value="" disabled>Select a source</option>
                                {allProviders.map((p: Provider, index: number) => (
                                    <option key={p.id} value={p.id}>
                                        {process.env.NEXT_PUBLIC_ENCODE_SERVER_NAMES === 'true' ? `Server ${index + 1}` : p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h1 className={styles.title}>{movie.title || movie.name}</h1>
                    <div className={styles.meta}>
                        <span>{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
                        {movie.runtime && <span>{movie.runtime} min</span>}
                        <span className={styles.rating}>★ {movie.vote_average?.toFixed(1)}</span>
                    </div>
                    <p className={styles.overview}>{movie.overview || 'No overview available.'}</p>
                </div>

                {recommendations.length > 0 && (
                    <section className={styles.recommendations}>
                        <h2 className={styles.recommendationsTitle}>Recommended for You</h2>
                        <div className={styles.recommendationsGrid}>
                            {recommendations.slice(0, 12).map(item => (
                                <MovieCard
                                    key={`rec-${item.id}`}
                                    id={item.id}
                                    title={item.title || item.name}
                                    posterPath={item.poster_path || ''}
                                    rating={item.vote_average}
                                    year={(item.release_date || item.first_air_date || '').split('-')[0]}
                                    type="movies"
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
