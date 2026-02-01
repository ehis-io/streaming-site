'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import styles from './page.module.css';
import { Content } from '@/types';

function MoviesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchQuery = searchParams.get('q') || '';
    const [movies, setMovies] = useState<Content[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const endpoint = searchQuery
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/movies/search?q=${searchQuery}&page=${page}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/movies/trending?page=${page}`;

        fetch(endpoint)
            .then(res => res.json())
            .then(data => setMovies(data.results || []))
            .catch(err => console.error('Fetch error:', err));
    }, [searchQuery, page]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo(0, 0);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('q', value);
        } else {
            params.delete('q');
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className={styles.container}>
            <header className={styles.hero}>
                <h1>Trending Movies</h1>
                <p>Browse the latest and most popular movies.</p>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search for movies..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </header>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'Trending Today'}</h2>
                <div className={styles.grid}>
                    {movies.length > 0 ? (
                        movies.map(movie => (
                            <MovieCard
                                key={movie.id}
                                id={movie.id}
                                title={movie.title || movie.name || 'Untitled'}
                                posterPath={movie.poster_path || ''}
                                rating={movie.vote_average}
                                year={(movie.release_date || movie.first_air_date || '').split('-')[0]}
                                type="movie"
                            />
                        ))
                    ) : (
                        <p>Loading movies...</p>
                    )}
                </div>

                <div className={styles.pagination}>
                    <button
                        disabled={page === 1}
                        onClick={() => handlePageChange(page - 1)}
                        className={styles.pageBtn}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>Page {page}</span>
                    <button
                        disabled={movies.length === 0}
                        onClick={() => handlePageChange(page + 1)}
                        className={styles.pageBtn}
                    >
                        Next
                    </button>
                </div>
            </section>
        </div>
    );
}

export default function MoviesPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <MoviesContent />
        </Suspense>
    );
}
