import { useState, useEffect, useCallback } from 'react';
import { socket } from '@/lib/socket';
import { StreamLink } from '@/types';

interface UseStreamsOptions {
    id: string;
    season?: number;
    episode?: number;
    type: 'sub' | 'dub';
    mediaType: string;
}

export function useStreams(options: UseStreamsOptions | null) {
    const [links, setLinks] = useState<StreamLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);

    const findStreams = useCallback(() => {
        if (!options) return;

        setLinks([]);
        setLoading(true);
        setComplete(false);

        if (!socket.connected) {
            socket.connect();
        }

        // Emit search request
        socket.emit('find-streams', options);

        // Listen for incremental results
        socket.on('stream-link', (link: StreamLink) => {
            setLinks((prev) => {
                // Deduplicate by URL
                if (prev.some(l => l.url === link.url)) return prev;
                return [...prev, link];
            });
        });

        // Listen for completion
        socket.on('streams-complete', (finalLinks: StreamLink[]) => {
            setLoading(false);
            setComplete(true);
            if (finalLinks && finalLinks.length > 0) {
                setLinks((prev) => {
                    const combined = [...prev];
                    finalLinks.forEach(l => {
                        if (!combined.some(existing => existing.url === l.url)) {
                            combined.push(l);
                        }
                    });
                    return combined;
                });
            }
        });

        return () => {
            socket.off('stream-link');
            socket.off('streams-complete');
        };
    }, [options]);

    useEffect(() => {
        const cleanup = findStreams();
        return cleanup;
    }, [findStreams]);

    return { links, loading, complete, refetch: findStreams };
}
