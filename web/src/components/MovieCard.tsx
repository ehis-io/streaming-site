import Link from 'next/link';
import Image from 'next/image';
import styles from './MovieCard.module.css';

interface MovieCardProps {
    id: number;
    title: string;
    posterPath: string;
    rating: number;
    year: string | number;
    type?: string;
}

export default function MovieCard({ id, title, posterPath, rating, year, type = 'movie' }: MovieCardProps) {
    const imageUrl = posterPath
        ? (posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`)
        : 'https://via.placeholder.com/500x750?text=No+Poster';

    const displayYear = typeof year === 'string' ? year.split('-')[0] : year;

    return (
        <Link href={`/${type}/${id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={imageUrl}
                    alt={title}
                    className={styles.poster}
                    width={500}
                    height={750}
                    priority={id < 5} // Priority for the first few cards
                    unoptimized={imageUrl.startsWith('http') && !imageUrl.includes('tmdb.org')}
                />
                <div className={styles.overlay}>
                    <div className={styles.rating}>{(rating || 0).toFixed(1)}</div>
                </div>
            </div>
            <div className={styles.info}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.meta}>{displayYear || 'N/A'}</p>
            </div>
        </Link>
    );
}
