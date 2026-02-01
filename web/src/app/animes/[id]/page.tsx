'use client';

import { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import styles from './page.module.css';
import { usePrefetch } from '@/hooks/usePrefetch';
import { useStreams } from '@/hooks/useStreams';

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

export default function AnimeDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [anime, setAnime] = useState<Anime | null>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [episode, setEpisode] = useState(1);
    const [type, setType] = useState<'sub' | 'dub'>('sub');
    const { prefetch } = usePrefetch();

    const { links: streamLinks } = useStreams(useMemo(() => ({
        id: params.id,
        episode,
        type,
        mediaType: 'anime'
    }), [params.id, episode, type]));

    const dynamicProviders = useMemo(() => {
        return streamLinks.map((link, index) => ({
            id: `dynamic-${index}`,
            name: link.provider || 'Auto',
            embedUrl: link.url
        }));
    }, [streamLinks]);

    useEffect(() => {
        setAnime(null);
        setSelectedProvider(null);

        // Fetch anime details
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/animes/${params.id}`)
            .then(res => res.json())
            .then(data => {
                const animeData = {
                    ...data.data,
                    localProviders: data.localProviders || []
                };
                setAnime(animeData);
            })
            .catch(err => console.error('Anime fetch error:', err));

        // Fetch recommendations
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/animes/${params.id}/recommendations`)
            .then(res => res.json())
            .then(data => {
                const results = data.data || [];
                setRecommendations(results);
                if (results.length > 0) {
                    const items = results.map((r: any) => r.entry);
                    prefetch(items, 'anime');
                }
            })
            .catch(err => console.error('Recommendations fetch error:', err));
    }, [params.id, prefetch]);

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

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://vidlink.pro') return;
            if (event.data?.type === 'MEDIA_DATA') {
                localStorage.setItem('vidLinkProgress', JSON.stringify(event.data.data));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!anime) return <Spinner />;

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
                                <p>Resolving stream links (Episode {episode})...</p>
                                <Spinner />
                            </div>
                        </div>
                    )}

                    <div className={styles.controlsBar}>
                        <div className={styles.controlGroup}>
                            <label>Episode</label>
                            <select
                                className={styles.select}
                                value={episode}
                                onChange={(e) => { setEpisode(Number(e.target.value)); setSelectedProvider(null); }}
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
                                onChange={(e) => { setType(e.target.value as 'sub' | 'dub'); setSelectedProvider(null); }}
                            >
                                <option value="sub">Subtitled</option>
                                <option value="dub">Dubbed</option>
                            </select>
                        </div>

                        <div className={styles.controlGroup}>
                            <label>Server</label>
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
                                        {process.env.NEXT_PUBLIC_ENCODE_SERVER_NAMES === 'true' ? `Server ${index + 1}` : p.name}
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

                {recommendations.length > 0 && (
                    <section className={styles.recommendations}>
                        <h2 className={styles.recommendationsTitle}>Recommended for You</h2>
                        <div className={styles.recommendationsGrid}>
                            {recommendations.slice(0, 12).map(item => (
                                <MovieCard
                                    key={`rec-${item.entry.mal_id}`}
                                    id={item.entry.mal_id}
                                    title={item.entry.title}
                                    posterPath={item.entry.images?.jpg?.large_image_url}
                                    rating={0}
                                    year={""}
                                    type="animes"
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
