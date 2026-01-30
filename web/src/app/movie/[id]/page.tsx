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
        fetch(`http://localhost:4001/api/v1/movies/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setMovie(data);
                if (data.localProviders?.length > 0) {
                    setSelectedProvider(data.localProviders[0]);
                }
            })
            .catch(err => console.error(err));
    }, [params.id]);

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
