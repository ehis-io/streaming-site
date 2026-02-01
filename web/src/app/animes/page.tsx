'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import styles from './page.module.css';

interface Anime {
    id: number;
    title?: string;
    name?: string;
    image_url?: string; // Jikan uses image_url or similar
    images?: {
        jpg?: {
            large_image_url?: string;
        }
    };
    score?: number;
    aired?: {
        from?: string;
    };
    year?: number;
    type?: string;
}

function AnimesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchQuery = searchParams.get('q') || '';
    const [animes, setAnimes] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const endpoint = searchQuery
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/animes/search?q=${searchQuery}&page=${page}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/animes/trending?page=${page}`;

        fetch(endpoint)
            .then(res => res.json())
            .then(data => {
                // Jikan format is slightly different
                setAnimes(data.data || data.results || []);
            })
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
                <h1>Trending Animes</h1>
                <p>Browse the latest and most popular animes.</p>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search for animes..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </header>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'Trending Now'}</h2>
                <div className={styles.grid}>
                    {animes.length > 0 ? (
                        animes.map(anime => (
                            <MovieCard
                                key={anime.mal_id || anime.id}
                                id={anime.mal_id || anime.id}
                                title={anime.title || anime.name || 'Untitled'}
                                posterPath={anime.images?.jpg?.large_image_url || anime.image_url || anime.poster_path || ''}
                                rating={anime.score || anime.vote_average || 0}
                                year={(anime.year || (anime.aired?.from || '').split('-')[0]) || ''}
                                type="animes"
                            />
                        ))
                    ) : (
                        <p>Loading animes...</p>
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
                        disabled={animes.length === 0}
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

export default function AnimesPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <AnimesContent />
        </Suspense>
    );
}
