'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setQuery(''); // Clear after search
            setResults([]);
            (document.activeElement as HTMLElement)?.blur();
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movies/search?q=${query}`)
                    .then(res => res.json())
                    .catch(() => ({ results: [] })),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tv/search?q=${query}`)
                    .then(res => res.json())
                    .catch(() => ({ results: [] })),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/animes/search?q=${query}`)
                    .then(res => res.json())
                    .catch(() => ({ data: [] }))
            ]).then(([movies, tv, animes]) => {
                const combined = [
                    ...(movies.results || []).slice(0, 3).map((m: any) => ({
                        ...m,
                        type: 'movie',
                        routeType: 'movie',
                        title: m.title,
                        year: m.release_date?.split('-')[0],
                        poster: m.poster_path
                    })),
                    ...(tv.results || []).slice(0, 3).map((t: any) => ({
                        ...t,
                        type: 'tv',
                        routeType: 'tv',
                        title: t.name,
                        year: t.first_air_date?.split('-')[0],
                        poster: t.poster_path
                    })),
                    ...(animes.data || []).slice(0, 3).map((a: any) => ({
                        ...a,
                        id: a.mal_id,
                        type: 'anime',
                        routeType: 'animes',
                        title: a.title,
                        year: a.year || (a.aired?.from ? a.aired.from.split('-')[0] : ''),
                        poster: a.images?.jpg?.large_image_url
                    }))
                ];
                setResults(combined);
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Stream<span>Hub</span>
                </Link>
                <nav className={styles.nav}>
                    <Link href="/movies">Movies</Link>
                    <Link href="/animes">Animes</Link>
                    <Link href="/tv">TV Shows</Link>
                    <Link href="/discover">Discover</Link>
                </nav>
                <div className={styles.search}>
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search movies, animes or tv shows..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        />
                    </form>

                    {isFocused && results.length > 0 && (
                        <div className={styles.popup}>
                            {results.map((item, idx) => (
                                <Link
                                    key={`${item.type}-${item.id}`}
                                    href={`/${item.routeType}/${item.id}`}
                                    className={styles.popupItem}
                                    onClick={() => {
                                        setQuery('');
                                        setResults([]);
                                    }}
                                >
                                    <img
                                        src={item.poster ? (item.poster.startsWith('http') ? item.poster : `https://image.tmdb.org/t/p/w92${item.poster}`) : 'https://via.placeholder.com/92x138'}
                                        alt={item.title}
                                        className={styles.popupImage}
                                    />
                                    <div className={styles.popupInfo}>
                                        <div className={styles.popupTitle}>{item.title}</div>
                                        <div className={styles.popupMeta}>
                                            <span className={styles.typeBadge}>{item.type}</span>
                                            <span>{item.year || 'N/A'}</span>
                                            {item.vote_average > 0 && <span>★ {item.vote_average.toFixed(1)}</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
