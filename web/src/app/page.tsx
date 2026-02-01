'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import styles from './page.module.css';
import { Content } from '@/types';
import { usePrefetch } from '@/hooks/usePrefetch';


function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = searchParams.get('q') || '';
  const [movies, setMovies] = useState<Content[]>([]);
  const [page, setPage] = useState(1);
  const { prefetch } = usePrefetch();

  useEffect(() => {
    const endpoint = searchQuery
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/search?q=${searchQuery}&page=${page}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/trending?page=${page}`;

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        const results = data.results || [];
        setMovies(results);
        if (results.length > 0) {
          prefetch(results);
        }
      })
      .catch(err => console.error('Fetch error:', err));
  }, [searchQuery, page, prefetch]);

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
        <h1>Unlimited Streaming</h1>
        <p>Discover movies and shows from official sources.</p>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Trending Movies & Shows</h2>
        <div className={styles.grid}>
          {movies.length > 0 ? (
            movies.map(movie => (
              <MovieCard
                key={`${movie.media_type || 'movie'}-${movie.id}`}
                id={movie.id}
                title={movie.title || movie.name || 'Untitled'}
                posterPath={movie.poster_path || ''}
                rating={movie.vote_average}
                year={(movie.release_date || movie.first_air_date || '').split('-')[0]}
                type={movie.media_type || 'movie'}
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
            disabled={movies.length === 0}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Spinner />}>
      <HomeContent />
    </Suspense>
  );
}
