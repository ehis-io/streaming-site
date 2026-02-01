'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import styles from './page.module.css';
import { Content } from '@/types';


function TVContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchQuery = searchParams.get('q') || '';
    const [shows, setShows] = useState<Content[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const endpoint = searchQuery
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tv/search?q=${searchQuery}&page=${page}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tv/trending?page=${page}`;

        fetch(endpoint)
            .then(res => res.json())
            .then(data => setShows(data.results || []))
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
            <section className={styles.hero}>
                <h1>Trending TV Shows</h1>
                <p>Discover the latest and greatest in television.</p>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search for TV shows..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'Trending Today'}</h2>
                <div className={styles.grid}>
                    {shows.length > 0 ? (
                        shows.map(show => (
                            <MovieCard
                                key={show.id}
                                id={show.id}
                                title={show.name || show.original_name || 'Untitled'}
                                posterPath={show.poster_path || ''}
                                rating={show.vote_average}
                                year={show.first_air_date || ''}
                                type="tv"
                            />
                        ))
                    ) : (
                        <Spinner />
                    )}
                </div>

                <div className={styles.pagination}>
                    <button
                        className={styles.navBtn}
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        Previous
                    </button>

                    <div className={styles.pageNumbers}>
                        {page > 1 && (
                            <button
                                className={`${styles.pageNumber} ${styles.fadedPage}`}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                {page - 1}
                            </button>
                        )}

                        <button className={`${styles.pageNumber} ${styles.activePage}`}>
                            {page}
                        </button>

                        <button
                            className={`${styles.pageNumber} ${styles.fadedPage}`}
                            onClick={() => handlePageChange(page + 1)}
                        >
                            {page + 1}
                        </button>
                    </div>

                    <button
                        className={styles.navBtn}
                        onClick={() => handlePageChange(page + 1)}
                        disabled={shows.length === 0}
                    >
                        Next
                    </button>
                </div>
            </section>
        </div>
    );
}

export default function TVListing() {
    return (
        <Suspense fallback={<Spinner />}>
            <TVContent />
        </Suspense>
    );
}
