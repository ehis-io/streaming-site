'use client';

import { useState } from 'react';
import styles from './AiModal.module.css';
import Spinner from './Spinner';
import Link from 'next/link';

interface AiModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface PlaylistItem {
    id: string;
    title: string;
    type: string;
    tmdbId?: number;
    malId?: number;
    posterPath?: string;
}

interface Playlist {
    id: string;
    name: string;
    description: string;
    items: PlaylistItem[];
}

export default function AiModal({ isOpen, onClose }: AiModalProps) {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/playlists/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await response.json();
            setPlaylist(data);
        } catch (error) {
            console.error('Failed to generate playlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                <header className={styles.header}>
                    <h2>Ask AI Movie Scout</h2>
                    <p>Describe your mood, favorites, or a vibe, and I'll build your playlist.</p>
                </header>

                <div className={styles.inputSection}>
                    <textarea
                        className={styles.textarea}
                        placeholder="What type of movies do you like? e.g. 'Mind-bending sci-fi with dark atmosphere' or 'Heartfelt anime movies like Your Name'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        className={styles.generateBtn}
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                    >
                        {isLoading ? 'Consulting Gemini...' : 'Generate My Playlist'}
                    </button>
                </div>

                {isLoading && (
                    <div className={styles.loadingWrapper}>
                        <Spinner />
                        <p className={styles.loadingText}>Gemini is searching the cinematic universe...</p>
                    </div>
                )}

                {playlist && !isLoading && (
                    <div className={styles.resultsSection}>
                        <div className={styles.resultsHeader}>
                            <h3>{playlist.name}</h3>
                            <p>{playlist.description}</p>
                        </div>
                        <div className={styles.resultsGrid}>
                            {playlist.items.map(item => (
                                <Link
                                    key={item.id}
                                    href={`/${item.type === 'anime' ? 'animes' : (item.type === 'tv' ? 'tv' : 'movies')}/${item.tmdbId || item.malId}`}
                                    className={styles.itemCard}
                                    onClick={onClose}
                                >
                                    <div className={styles.posterWrapper}>
                                        <img
                                            src={item.posterPath ? (item.posterPath.startsWith('http') ? item.posterPath : `https://image.tmdb.org/t/p/w185${item.posterPath}`) : 'https://via.placeholder.com/185x278/111/fff?text=No+Poster'}
                                            alt={item.title}
                                        />
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemTitle}>{item.title}</div>
                                        <div className={styles.itemType}>{item.type}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
