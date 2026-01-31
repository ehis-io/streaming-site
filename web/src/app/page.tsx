'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import styles from './page.module.css';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = searchParams.get('q') || '';
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const endpoint = searchQuery
      ? `http://localhost:4001/api/v1/search?q=${searchQuery}&page=${page}`
      : `http://localhost:4001/api/v1/trending?page=${page}`;

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
            <p>Loading trending content...</p>
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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
