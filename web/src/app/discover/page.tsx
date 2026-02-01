'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import styles from './page.module.css';

interface Genre {
    id: number;
    name: string;
}

interface Content {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
}

function DiscoverContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const type = searchParams.get('type') || 'movie';
    const genreId = searchParams.get('genre') || '';
    const sortBy = searchParams.get('sort') || 'popularity.desc';
    const yearFilter = searchParams.get('year') || 'all';
    const page = Number(searchParams.get('page')) || 1;

    const [results, setResults] = useState<Content[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAlphabetPopup, setShowAlphabetPopup] = useState(false);

    // Fetch genres when type changes
    useEffect(() => {
        const endpoint = type === 'anime' ? 'animes' : (type === 'movie' ? 'movies' : 'tv');
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/${endpoint}/genres`)
            .then(res => res.json())
            .then(data => setGenres(data.genres || []))
            .catch(err => console.error('Genres fetch error:', err));
    }, [type]);

    // Calculate dates based on filter
    const getDateParams = (): Record<string, string> => {
        if (yearFilter === 'all') return {};

        const now = new Date();
        const currentYear = now.getFullYear();
        let startYear = currentYear;
        let endYear = currentYear;

        if (yearFilter === 'last_year') {
            startYear = currentYear - 1;
            endYear = currentYear - 1;
        } else if (yearFilter === 'last2') {
            startYear = currentYear - 2;
        } else if (yearFilter === 'last5') {
            startYear = currentYear - 5;
        }

        const dateGte = `${startYear}-01-01`;
        const dateLte = `${endYear}-12-31`;

        // TMDB uses different params for Movies vs TV
        if (type === 'tv') {
            return {
                'first_air_date.gte': dateGte,
                'first_air_date.lte': dateLte
            };
        }

        // Movies and Anime (mapped in backend) use primary_release_date
        return {
            'primary_release_date.gte': dateGte,
            'primary_release_date.lte': dateLte
        };
    };

    // Fetch discovered content
    useEffect(() => {
        setIsLoading(true);
        const dateParams = getDateParams();
        const params = new URLSearchParams({
            page: String(page),
            sort_by: sortBy,
            with_genres: genreId,
            ...dateParams
        });

        const endpoint = type === 'anime' ? 'animes' : (type === 'movie' ? 'movies' : 'tv');
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/${endpoint}/discover?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setResults(data.results || []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Discover fetch error:', err);
                setIsLoading(false);
            });
    }, [type, genreId, sortBy, yearFilter, page]);

    const updateFilter = (updates: Record<string, string | number | undefined>) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, String(value));
            } else {
                params.delete(key);
            }
        });
        // Reset page on filter change
        if (!updates.page) params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className={styles.container}>
            <header className={styles.discoverHeader}>
                <h1>Discover Content</h1>
                <div className={styles.filterBar}>
                    <div className={styles.filterGroup}>
                        <label>Type</label>
                        <select
                            value={type}
                            onChange={(e) => updateFilter({ type: e.target.value, genre: '', page: 1 })}
                            className={styles.select}
                        >
                            <option value="movie">Movies</option>
                            {/* <option value="anime">Animes</option> */}
                            <option value="tv">TV Shows</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Year</label>
                        <select
                            value={yearFilter}
                            onChange={(e) => updateFilter({ year: e.target.value, page: 1 })}
                            className={styles.select}
                        >
                            <option value="all">All Years</option>
                            <option value="current">Current Year ({new Date().getFullYear()})</option>
                            <option value="last_year">Last Year ({new Date().getFullYear() - 1})</option>
                            <option value="last2">Last 2 Years</option>
                            <option value="last5">Last 5 Years</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Genre</label>
                        <select
                            value={genreId}
                            onChange={(e) => updateFilter({ genre: e.target.value, page: 1 })}
                            className={styles.select}
                        >
                            <option value="">All Genres</option>
                            {genres.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => updateFilter({ sort: e.target.value })}
                            className={styles.select}
                        >
                            <option value="popularity.desc">Most Popular</option>
                            <option value="vote_average.desc">Highly Rated</option>
                            <option value="primary_release_date.desc">Year (Newest)</option>
                            <option value="primary_release_date.asc">Year (Oldest)</option>
                        </select>
                    </div>

                    <button
                        className={styles.azButton}
                        onClick={() => setShowAlphabetPopup(true)}
                    >
                        Index A-Z
                    </button>
                </div>
            </header>

            {showAlphabetPopup && (
                <div className={styles.popupOverlay} onClick={() => setShowAlphabetPopup(false)}>
                    <div className={styles.popupContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.popupHeader}>
                            <h2>Browse by Letter</h2>
                            <button className={styles.closeBtn} onClick={() => setShowAlphabetPopup(false)}>×</button>
                        </div>
                        <div className={styles.alphabetGrid}>
                            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                                <a
                                    key={letter}
                                    href={`/search?q=${letter}`}
                                    className={styles.alphabetBtn}
                                >
                                    {letter}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <section className={styles.section}>
                {isLoading ? (
                    <Spinner />
                ) : (
                    <div className={styles.grid}>
                        {results.length > 0 ? (
                            results.map(item => (
                                <MovieCard
                                    key={`${type}-${item.id}`}
                                    id={item.id}
                                    title={item.title || item.name || 'Untitled'}
                                    posterPath={item.poster_path || ''}
                                    rating={item.vote_average}
                                    year={(item.release_date || item.first_air_date || '').split('-')[0]}
                                    type={type === 'anime' ? 'animes' : (type as 'movie' | 'tv')}
                                />
                            ))
                        ) : (
                            <p>No results found for these filters.</p>
                        )}
                    </div>
                )}

                <div className={styles.pagination}>
                    <button
                        className={styles.navBtn}
                        onClick={() => updateFilter({ page: page - 1 })}
                        disabled={page <= 1}
                    >
                        Previous
                    </button>

                    <div className={styles.pageNumbers}>
                        {page > 1 && (
                            <button
                                className={`${styles.pageNumber} ${styles.fadedPage}`}
                                onClick={() => updateFilter({ page: page - 1 })}
                            >
                                {page - 1}
                            </button>
                        )}

                        <button className={`${styles.pageNumber} ${styles.activePage}`}>
                            {page}
                        </button>

                        <button
                            className={`${styles.pageNumber} ${styles.fadedPage}`}
                            onClick={() => updateFilter({ page: page + 1 })}
                        >
                            {page + 1}
                        </button>
                    </div>

                    <button
                        className={styles.navBtn}
                        onClick={() => updateFilter({ page: page + 1 })}
                        disabled={results.length === 0}
                    >
                        Next
                    </button>
                </div>
            </section>
        </div >
    );
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <DiscoverContent />
        </Suspense>
    );
}
