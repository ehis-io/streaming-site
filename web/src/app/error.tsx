'use client';

import { useEffect } from 'react';
import styles from './page.module.css'; // Re-using page styles or we can handle inline

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Page error:', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
                Something went wrong!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px' }}>
                We encountered an unexpected error while loading this page.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => reset()}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '0.8rem 1.5rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Try again
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        background: 'var(--secondary)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0.8rem 1.5rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
