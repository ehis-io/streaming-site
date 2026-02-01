'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body style={{
                background: '#0a0a0a',
                color: 'white',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                margin: 0
            }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Critical Error</h2>
                <p style={{ color: '#888', marginBottom: '2rem' }}>The application encountered a critical error.</p>
                <button
                    onClick={() => reset()}
                    style={{
                        background: '#e50914',
                        color: 'white',
                        border: 'none',
                        padding: '0.8rem 1.5rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Reload Application
                </button>
            </body>
        </html>
    );
}
