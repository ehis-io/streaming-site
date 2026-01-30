'use client';

import { useEffect, useState, use } from 'react';
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

export default function MovieDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

    useEffect(() => {
        // Fetch movie details
        fetch(`http://localhost:4001/api/v1/movies/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setMovie(data);
                // Initial providers from DB
                if (data.localProviders?.length > 0 && !selectedProvider) {
                    setSelectedProvider(data.localProviders[0]);
                }
            })
            .catch(err => console.error('Movie fetch error:', err));

        // Fetch dynamic streams
        fetch(`http://localhost:4001/api/v1/streams/${params.id}`)
            .then(res => res.json())
            .then((links: any[]) => {
                setMovie(prev => {
                    if (!prev) return prev;

                    const dynamicProviders = links.map((link, index) => ({
                        id: `dynamic-${index}`,
                        name: link.provider,
                        embedUrl: link.url
                    }));

                    // Combine local and dynamic providers, avoiding duplicates if possible
                    const combined = [...(prev.localProviders || []), ...dynamicProviders];

                    // Auto-select first dynamic provider if no local one was selected
                    if (dynamicProviders.length > 0 && (!selectedProvider || selectedProvider.id.startsWith('dynamic-'))) {
                        setSelectedProvider(dynamicProviders[0]);
                    }

                    return { ...prev, localProviders: combined };
                });
            })
            .catch(err => console.error('Streams fetch error:', err));
    }, [params.id, selectedProvider]);

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
                                <p>No legal embeds found for this title.</p>
                                <span>Check back later or try another source.</span>
                            </div>
                        </div>
                    )}

                    <div className={styles.providerSelector}>
                        {movie.localProviders?.map((p: Provider) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProvider(p)}
                                className={selectedProvider?.id === p.id ? styles.activeBtn : styles.btn}
                            >
                                {p.name}
                            </button>
                        ))}
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
