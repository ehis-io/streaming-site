'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'rgba(229, 9, 20, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(229, 9, 20, 0.3)',
                    margin: '1rem 0',
                    color: 'var(--foreground)'
                }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Something went wrong</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        We could not load this section.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            background: 'var(--secondary)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
