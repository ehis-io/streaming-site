'use client';

import { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { config } from '@/config';

interface Provider {
    id: string;
    name: string;
    embedUrl: string;
}

interface Anime {
    mal_id: number;
    title: string;
    synopsis: string;
    images: {
        jpg: {
            large_image_url: string;
        };
    };
    score: number;
    year: number;
    episodes: number;
    status: string;
    localProviders: Provider[];
}

interface StreamLink {
    provider: string;
    url: string;
}

export default function AnimeDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [anime, setAnime] = useState<Anime | null>(null);
    const [dynamicProviders, setDynamicProviders] = useState<Provider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [episode, setEpisode] = useState(1);
    const [type, setType] = useState<'sub' | 'dub'>('sub');

    useEffect(() => {
        setAnime(null);
        setDynamicProviders([]);
        setSelectedProvider(null);

        // Fetch anime details
        fetch(`http://localhost:4001/api/v1/animes/${params.id}`)
            .then(res => res.json())
            .then(data => {
                const animeData = {
                    ...data.data,
                    localProviders: data.localProviders || []
                };
                setAnime(animeData);
            })
            .catch(err => console.error('Anime fetch error:', err));
    }, [params.id]);

    useEffect(() => {
        setDynamicProviders([]);
        setSelectedProvider(null);

        // Fetch dynamic streams
        fetch(`http://localhost:4001/api/v1/streams/${params.id}?episode=${episode}&type=${type}&mediaType=anime`)
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
    }, [params.id, episode, type]);

    const allProviders = useMemo(() => {
        const local = anime?.localProviders || [];
        const dynamic = dynamicProviders;
        const seen = new Set<string>();
        return [...local, ...dynamic].filter(p => {
            if (seen.has(String(p.id))) return false;
            seen.add(String(p.id));
            return true;
        });
    }, [anime, dynamicProviders]);

    useEffect(() => {
        if (!selectedProvider && allProviders.length > 0) {
            setSelectedProvider(allProviders[0]);
        }
    }, [allProviders, selectedProvider]);

    // VidLink Event Listeners for Watch Progress
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://vidlink.pro') return;

            // Handle watch progress data
            if (event.data?.type === 'MEDIA_DATA') {
                const mediaData = event.data.data;
                console.log('VidLink Anime: Received media progress data', mediaData);
                localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
            }

            // Handle player events
            if (event.data?.type === 'PLAYER_EVENT') {
                const { event: eventType, currentTime, duration, mediaType } = event.data.data;
                console.log(`VidLink Anime Player Event: ${eventType} at ${currentTime}s of ${duration}s (${mediaType})`);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!anime) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div
                className={styles.backdrop}
                style={{ backgroundImage: `url(${anime.images.jpg.large_image_url})` }}
            >
                <div className={styles.backdropOverlay} />
            </div>

            <div className={styles.content}>
                <Link href="/animes" className={styles.backBtn}>
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
                                <p>No streams found for this anime (Episode {episode}).</p>
                                <span>Check back later or try another source.</span>
                            </div>
                        </div>
                    )}

                    <div className={styles.controlsSection}>
                        <div className={styles.controlGroup}>
                            <label>Episode</label>
                            <select
                                className={styles.select}
                                value={episode}
                                onChange={(e) => setEpisode(Number(e.target.value))}
                            >
                                {Array.from({ length: anime.episodes || 1 }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num}>
                                        Episode {num}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.controlGroup}>
                            <label>Preference</label>
                            <select
                                className={styles.select}
                                value={type}
                                onChange={(e) => setType(e.target.value as 'sub' | 'dub')}
                            >
                                <option value="sub">Subtitled</option>
                                <option value="dub">Dubbed</option>
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
                                {allProviders.map((p, index) => (
                                    <option key={p.id} value={p.id}>
                                        {config.encodeServerNames ? `Server ${index + 1}` : p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h1 className={styles.title}>{anime.title}</h1>
                    <div className={styles.meta}>
                        <span>{anime.year || 'N/A'}</span>
                        {anime.episodes && <span>{anime.episodes} Episodes</span>}
                        <span>{anime.status}</span>
                        <span className={styles.rating}>★ {anime.score?.toFixed(1)}</span>
                    </div>
                    <p className={styles.overview}>{anime.synopsis || 'No synopsis available.'}</p>
                </div>
            </div>
        </div>
    );
}
