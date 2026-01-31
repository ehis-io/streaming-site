'use client';

import { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Provider {
    id: string;
    name: string;
    embedUrl: string;
}

interface Movie {
    id: number;
    title?: string;
    name?: string;
    backdrop_path: string;
    release_date?: string;
    first_air_date?: string;
    runtime?: number;
    vote_average: number;
    overview: string;
    localProviders: Provider[];
}

interface StreamLink {
    provider: string;
    url: string;
}

export default function MovieDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [dynamicProviders, setDynamicProviders] = useState<Provider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMovie(null);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDynamicProviders([]);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedProvider(null);

        // Fetch movie details
        fetch(`http://localhost:4001/api/v1/movies/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setMovie(data);
            })
            .catch(err => console.error('Movie fetch error:', err));

        // Fetch dynamic streams
        fetch(`http://localhost:4001/api/v1/streams/${params.id}`)
            .then(res => res.json())
            .then((links: StreamLink[]) => {
                const providers = links.map((link, index) => ({
                    id: `dynamic-${index}`,
                    name: link.provider,
                    embedUrl: link.url
                }));
                setDynamicProviders(providers);
            })
            .catch(err => console.error('Streams fetch error:', err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const allProviders = useMemo(() => {
        const local = movie?.localProviders || [];
        const dynamic = dynamicProviders;

        // Deduplicate providers to prevent key collisions (handling potential HMR state artifacts)
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

            // Handle watch progress data
            if (event.data?.type === 'MEDIA_DATA') {
                const mediaData = event.data.data;
                console.log('VidLink: Received media progress data', mediaData);
                localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
            }

            // Handle player events
            if (event.data?.type === 'PLAYER_EVENT') {
                const { event: eventType, currentTime, duration, mediaType } = event.data.data;
                console.log(`VidLink Player Event: ${eventType} at ${currentTime}s of ${duration}s (${mediaType})`);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);


    if (!movie) return <div className={styles.loading}>Loading...</div>;

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
                                <p>No streams found for this movie.</p>
                                <span>Check back later or try another source.</span>
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
                                {allProviders.map((p: Provider) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
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

            </div>
        </div>
    );
}
