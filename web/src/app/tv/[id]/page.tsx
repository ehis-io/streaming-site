'use client';

import { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import Spinner from '@/components/Spinner';
import styles from './page.module.css';
import { config } from '@/config';


interface Provider {
    id: string;
    name: string;
    embedUrl: string;
}

interface Season {
    season_number: number;
    episode_count: number;
    name: string;
}

interface TVShow {
    id: number;
    name?: string;
    title?: string; // Fallback
    backdrop_path: string;
    first_air_date?: string;
    vote_average: number;
    overview: string;
    localProviders: Provider[];
    seasons?: Season[];
    number_of_seasons?: number;
}

interface StreamLink {
    provider: string;
    url: string;
}

export default function TVDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [show, setShow] = useState<TVShow | null>(null);
    const [dynamicProviders, setDynamicProviders] = useState<Provider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShow(null);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDynamicProviders([]);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedProvider(null);

        // Fetch TV show details
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tv/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setShow(data);
            })
            .catch(err => console.error('TV fetch error:', err));

        // Fetch dynamic streams
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/streams/${params.id}?season=${season}&episode=${episode}`)
            .then(res => res.json())
            .then((links: StreamLink[]) => {
                const providers = links.map((link, index) => ({
                    id: `dynamic-${index}`,
                    name: link.provider,
                    embedUrl: link.url
                }));
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setDynamicProviders(providers);
            })
            .catch(err => console.error('Streams fetch error:', err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id, season, episode]);

    const allProviders = useMemo(() => {
        const local = show?.localProviders || [];
        const dynamic = dynamicProviders;

        // Deduplicate providers
        const seen = new Set<string>();
        return [...local, ...dynamic].filter(p => {
            if (seen.has(String(p.id))) return false;
            seen.add(String(p.id));
            return true;
        });
    }, [show, dynamicProviders]);

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
                console.log('VidLink TV: Received media progress data', mediaData);
                localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
            }

            // Handle player events
            if (event.data?.type === 'PLAYER_EVENT') {
                const { event: eventType, currentTime, duration, mediaType } = event.data.data;
                console.log(`VidLink TV Player Event: ${eventType} at ${currentTime}s of ${duration}s (${mediaType})`);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!show) return <Spinner />;

    const backdropUrl = show.backdrop_path
        ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
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
                                <p>No streams found for this show (S1E1).</p>
                                <span>Check back later or try another source.</span>
                            </div>
                        </div>
                    )}

                    <div className={styles.controlsSection}>
                        <div className={styles.controlGroup}>
                            <label>Season</label>
                            <select
                                className={styles.select}
                                value={season}
                                onChange={(e) => {
                                    setSeason(Number(e.target.value));
                                    setEpisode(1); // Reset episode on season change
                                }}
                            >
                                {show.seasons?.filter(s => s.season_number > 0).map(s => (
                                    <option key={s.season_number} value={s.season_number}>
                                        Season {s.season_number}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.controlGroup}>
                            <label>Episode</label>
                            <select
                                className={styles.select}
                                value={episode}
                                onChange={(e) => setEpisode(Number(e.target.value))}
                            >
                                {(() => {
                                    const currentSeason = show.seasons?.find(s => s.season_number === season);
                                    const count = currentSeason?.episode_count || 1;
                                    return Array.from({ length: count }, (_, i) => i + 1).map(num => (
                                        <option key={num} value={num}>
                                            Episode {num}
                                        </option>
                                    ));
                                })()}
                            </select>
                        </div>
                    </div>

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
                                        {config.encodeServerNames ? `Server ${index + 1}` : p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h1 className={styles.title}>{show.name || show.title}</h1>
                    <div className={styles.meta}>
                        <span>{show.first_air_date?.split('-')[0]}</span>
                        {show.number_of_seasons && <span>{show.number_of_seasons} Seasons</span>}
                        <span className={styles.rating}>★ {show.vote_average?.toFixed(1)}</span>
                    </div>
                    <p className={styles.overview}>{show.overview || 'No overview available.'}</p>
                </div>
            </div>
        </div>
    );
}
