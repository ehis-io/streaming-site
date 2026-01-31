'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/?q=${encodeURIComponent(query)}`);
            setQuery(''); // Clear after search
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Stream<span>Hub</span>
                </Link>
                <nav className={styles.nav}>
                    <Link href="/movies">Movies</Link>
                    <Link href="/tv">TV Shows</Link>
                    <Link href="/discover">Discover</Link>
                </nav>
                <div className={styles.search}>
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search movies or shows..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </form>
                </div>
            </div>
        </header>
    );
}
