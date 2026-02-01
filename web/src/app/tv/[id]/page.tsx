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

interface Season {
    season_number: number;
    episode_count: number;
    name: string;
}

interface TVShow {
    id: number;
    name?: string;
    title?: string;
    backdrop_path: string;
    first_air_date?: string;
    vote_average: number;
    overview: string;
    localProviders: Provider[];
    seasons?: Season[];
    number_of_seasons?: number;
}

export default function TVDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [show, setShow] = useState<TVShow | null>(null);
    const [recommendations, setRecommendations] = useState<TVShow[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const { prefetch } = usePrefetch();

    const { links: streamLinks } = useStreams(useMemo(() => ({
        id: params.id,
        season,
        episode,
        type: 'sub',
        mediaType: 'tv'
    }), [params.id, season, episode]));

    const dynamicProviders = useMemo(() => {
        return streamLinks.map((link, index) => ({
            id: `dynamic-${index}`,
            name: link.provider || 'Auto',
            embedUrl: link.url
        }));
    }, [streamLinks]);

    useEffect(() => {
        setShow(null);
        setRecommendations([]);
        setSelectedProvider(null);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tv/${params.id}`)
            .then(res => res.json())
            .then(data => setShow(data))
            .catch(err => console.error('TV fetch error:', err));

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tv/${params.id}/recommendations`)
            .then(res => res.json())
            .then(data => {
                const results = data.results || [];
                setRecommendations(results);
                if (results.length > 0) prefetch(results as any, 'tv');
            })
            .catch(err => console.error('Recommendations fetch error:', err));
    }, [params.id, prefetch]);

    const allProviders = useMemo(() => {
        const local = show?.localProviders || [];
        const dynamic = dynamicProviders;
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

    if (!show) return <Spinner />;

    const backdropUrl = show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : '';

    return (
        <div className={styles.container}>
            <div className={styles.backdrop} style={{ backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none' }}>
                <div className={styles.backdropOverlay} />
            </div>

            <div className={styles.content}>
                <Link href="/" className={styles.backBtn}>← Back to Catalog</Link>

                <div className={styles.playerSection}>
                    {selectedProvider ? (
                        <div className={styles.playerWrapper}>
                            <iframe src={selectedProvider.embedUrl} allowFullScreen className={styles.iframe} title="Video Player" />
                        </div>
                    ) : (
                        <div className={styles.noPlayer}>
                            <div className={styles.noPlayerContent}>
                                <p>Resolving stream links (S{season}E{episode})...</p>
                                <Spinner />
                            </div>
                        </div>
                    )}

                    <div className={styles.controlsBar}>
                        <div className={styles.controlGroup}>
                            <label>Season</label>
                            <select className={styles.select} value={season} onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); setSelectedProvider(null); }}>
                                {show.seasons?.filter(s => s.season_number > 0).map(s => (
                                    <option key={s.season_number} value={s.season_number}>Season {s.season_number}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.controlGroup}>
                            <label>Episode</label>
                            <select className={styles.select} value={episode} onChange={(e) => { setEpisode(Number(e.target.value)); setSelectedProvider(null); }}>
                                {(() => {
                                    const currentSeason = show.seasons?.find(s => s.season_number === season);
                                    const count = currentSeason?.episode_count || 1;
                                    return Array.from({ length: count }, (_, i) => i + 1).map(num => (
                                        <option key={num} value={num}>Episode {num}</option>
                                    ));
                                })()}
                            </select>
                        </div>
                        <div className={styles.controlGroup}>
                            <label>Server</label>
                            <select className={styles.select} value={selectedProvider?.id || ''} onChange={(e) => {
                                const provider = allProviders.find(p => p.id === e.target.value);
                                if (provider) setSelectedProvider(provider);
                            }}>
                                <option value="" disabled>Select a source</option>
                                {allProviders.map((p, index) => (
                                    <option key={p.id} value={p.id}>{process.env.NEXT_PUBLIC_ENCODE_SERVER_NAMES === 'true' ? `Server ${index + 1}` : p.name}</option>
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

                {recommendations.length > 0 && (
                    <section className={styles.recommendations}>
                        <h2 className={styles.recommendationsTitle}>Recommended for You</h2>
                        <div className={styles.recommendationsGrid}>
                            {recommendations.slice(0, 12).map(item => (
                                <MovieCard
                                    key={`rec-${item.id}`}
                                    id={item.id}
                                    title={item.name || item.title}
                                    posterPath={item.poster_path || item.backdrop_path || ''}
                                    rating={item.vote_average}
                                    year={(item.first_air_date || '').split('-')[0]}
                                    type="tv"
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
