import Link from 'next/link';
import Image from 'next/image';
import styles from './MovieCard.module.css';

interface MovieCardProps {
    id: number;
    title: string;
    posterPath: string;
    rating: number;
    year: string;
}

export default function MovieCard({ id, title, posterPath, rating, year }: MovieCardProps) {
    const imageUrl = posterPath
        ? `https://image.tmdb.org/t/p/w500${posterPath}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

    return (
        <Link href={`/movie/${id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={imageUrl}
                    alt={title}
                    className={styles.poster}
                    width={500}
                    height={750}
                    priority={id < 5} // Priority for the first few cards
                />
                <div className={styles.overlay}>
                    <div className={styles.rating}>{rating.toFixed(1)}</div>
                </div>
            </div>
            <div className={styles.info}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.meta}>{year ? year.split('-')[0] : 'N/A'}</p>
            </div>
        </Link>
    );
}
