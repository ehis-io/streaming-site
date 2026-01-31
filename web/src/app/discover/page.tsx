'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
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
    const page = Number(searchParams.get('page')) || 1;

    const [results, setResults] = useState<Content[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch genres when type changes
    useEffect(() => {
        fetch(`http://localhost:4001/api/v1/${type === 'movie' ? 'movies' : 'tv'}/genres`)
            .then(res => res.json())
            .then(data => setGenres(data.genres || []))
            .catch(err => console.error('Genres fetch error:', err));
    }, [type]);

    // Fetch discovered content
    useEffect(() => {
        setIsLoading(true);
        const params = new URLSearchParams({
            page: String(page),
            sort_by: sortBy,
            with_genres: genreId
        });

        fetch(`http://localhost:4001/api/v1/${type === 'movie' ? 'movies' : 'tv'}/discover?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setResults(data.results || []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Discover fetch error:', err);
                setIsLoading(false);
            });
    }, [type, genreId, sortBy, page]);

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
                            onChange={(e) => updateFilter({ type: e.target.value, genre: '' })}
                            className={styles.select}
                        >
                            <option value="movie">Movies</option>
                            <option value="tv">TV Shows</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Genre</label>
                        <select
                            value={genreId}
                            onChange={(e) => updateFilter({ genre: e.target.value })}
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
                            <option value="primary_release_date.desc">Newest First</option>
                        </select>
                    </div>
                </div>
            </header>

            <section className={styles.section}>
                <div className={styles.grid}>
                    {isLoading ? (
                        <p>Loading discoveries...</p>
                    ) : results.length > 0 ? (
                        results.map(item => (
                            <MovieCard
                                key={`${type}-${item.id}`}
                                id={item.id}
                                title={item.title || item.name || 'Untitled'}
                                posterPath={item.poster_path || ''}
                                rating={item.vote_average}
                                year={(item.release_date || item.first_air_date || '').split('-')[0]}
                                type={type as 'movie' | 'tv'}
                            />
                        ))
                    ) : (
                        <p>No results found for these filters.</p>
                    )}
                </div>

                <div className={styles.pagination}>
                    <button
                        disabled={page === 1}
                        onClick={() => updateFilter({ page: page - 1 })}
                        className={styles.pageBtn}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>Page {page}</span>
                    <button
                        disabled={results.length === 0}
                        onClick={() => updateFilter({ page: page + 1 })}
                        className={styles.pageBtn}
                    >
                        Next
                    </button>
                </div>
            </section>
        </div>
    );
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DiscoverContent />
        </Suspense>
    );
}
