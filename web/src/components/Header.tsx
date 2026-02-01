'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { useTheme } from '@/context/ThemeProvider';
import AiModal from './AiModal';

export default function Header() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

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
                        routeType: 'movies',
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
        <>
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

                        {/* Ask AI - Mobile */}
                        <button
                            className={styles.mobileAiButton}
                            onClick={() => {
                                setIsAiModalOpen(true);
                                setIsMenuOpen(false);
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.aiLogo}>
                                <path d="M12 3C12 3 12.5 8 17 8C17 8 12 8.5 12 13.5C12 13.5 11.5 8.5 7 8.5C7 8.5 12 8 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="9" cy="5.5" r="1" fill="currentColor" />
                                <circle cx="10.5" cy="4.5" r="1" fill="currentColor" />
                                <path d="M19 14C19 14 19.3 17 22 17C22 17 19 17.3 19 20C19 20 18.7 17.3 16 17.3C16 17.3 19 17 19 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="20.5" cy="18.5" r="0.8" fill="currentColor" />
                            </svg>
                            <span>Ask AI Assistant</span>
                        </button>

                        {/* Theme Toggle - Mobile */}
                        <button className={styles.mobileThemeToggle} onClick={toggleTheme}>
                            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                        </button>

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

                    {/* AI Assistant Button */}
                    <button
                        className={styles.aiButton}
                        onClick={() => setIsAiModalOpen(true)}
                        aria-label="Ask AI Assistant"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.aiLogo}>
                            {/* Main Sparkle */}
                            <path d="M12 3C12 3 12.5 8 17 8C17 8 12 8.5 12 13.5C12 13.5 11.5 8.5 7 8.5C7 8.5 12 8 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            {/* Dotted effect on main sparkle */}
                            <circle cx="9" cy="5.5" r="1" fill="currentColor" />
                            <circle cx="10.5" cy="4.5" r="1" fill="currentColor" />

                            {/* Smaller Sparkle */}
                            <path d="M19 14C19 14 19.3 17 22 17C22 17 19 17.3 19 20C19 20 18.7 17.3 16 17.3C16 17.3 19 17 19 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            {/* Dotted effect on smaller sparkle */}
                            <circle cx="20.5" cy="18.5" r="0.8" fill="currentColor" />
                        </svg>
                        <span>Ask AI..</span>
                    </button>

                    {/* Theme Toggle - Desktop (Moved to far right) */}
                    <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'dark' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            <AiModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
            />
        </>
    );
}
