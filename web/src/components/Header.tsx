'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setQuery('');
            setResults([]);
            setIsMenuOpen(false);
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

                {/* Desktop Nav */}
                <nav className={styles.nav}>
                    <Link href="/movies">Movies</Link>
                    <Link href="/animes">Animes</Link>
                    <Link href="/tv">TV Shows</Link>
                    <Link href="/discover">Discover</Link>
                </nav>

                {/* Mobile Menu Button */}
                <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
                    <Link href="/movies" onClick={toggleMenu}>Movies</Link>
                    <Link href="/animes" onClick={toggleMenu}>Animes</Link>
                    <Link href="/tv" onClick={toggleMenu}>TV Shows</Link>
                    <Link href="/discover" onClick={toggleMenu}>Discover</Link>

                    {/* Search at bottom */}
                    <div className={styles.mobileSearch}>
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </form>
                    </div>
                </div>

                {/* Desktop Search */}
                <div className={styles.search}>
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search..."
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
