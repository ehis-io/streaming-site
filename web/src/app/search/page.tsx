'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import styles from './page.module.css';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [movies, setMovies] = useState<any[]>([]);
    const [tv, setTv] = useState<any[]>([]);
    const [animes, setAnimes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movies/search?q=${query}`).then(res => res.json()).catch(() => ({ results: [] })),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tv/search?q=${query}`).then(res => res.json()).catch(() => ({ results: [] })),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/animes/search?q=${query}`).then(res => res.json()).catch(() => ({ data: [] }))
        ]).then(([moviesData, tvData, animesData]) => {
            setMovies(moviesData.results || []);
            setTv(tvData.results || []);
            setAnimes(animesData.data || []); // Jikan returns { data: [] }
        }).catch(err => {
            console.error('Search failed', err);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [query]);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const hasResults = movies.length > 0 || tv.length > 0 || animes.length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Search Results</h1>
                <p>{query ? `Showing results for "${query}"` : 'Browse content or search for titles'}</p>
            </div>

            <div className={styles.alphabetBar}>
                {alphabet.map(letter => (
                    <a
                        key={letter}
                        href={`/search?q=${letter}`}
                        className={`${styles.alphabetBtn} ${query.toUpperCase() === letter ? styles.active : ''}`}
                    >
                        {letter}
                    </a>
                ))}
            </div>

            {isLoading && <Spinner />}

            {!isLoading && !hasResults && query && <div className={styles.noResults}>No results found</div>}

            {!isLoading && movies.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Movies <span>({movies.length})</span></h2>
                    <div className={styles.grid}>
                        {movies.map(item => (
                            <MovieCard
                                key={`movie-${item.id}`}
                                id={item.id}
                                title={item.title}
                                posterPath={item.poster_path}
                                rating={item.vote_average}
                                year={item.release_date}
                                type="movie"
                            />
                        ))}
                    </div>
                </section>
            )}

            {!isLoading && tv.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>TV Shows <span>({tv.length})</span></h2>
                    <div className={styles.grid}>
                        {tv.map(item => (
                            <MovieCard
                                key={`tv-${item.id}`}
                                id={item.id}
                                title={item.name}
                                posterPath={item.poster_path}
                                rating={item.vote_average}
                                year={item.first_air_date}
                                type="tv"
                            />
                        ))}
                    </div>
                </section>
            )}

            {!isLoading && animes.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Animes <span>({animes.length})</span></h2>
                    <div className={styles.grid}>
                        {animes.map(item => (
                            <MovieCard
                                key={`anime-${item.mal_id}`}
                                id={item.mal_id}
                                title={item.title}
                                posterPath={item.images?.jpg?.large_image_url}
                                rating={item.score}
                                year={item.aired?.from}
                                type="animes"
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <SearchResults />
        </Suspense>
    );
}
