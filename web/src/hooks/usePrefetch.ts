import { useCallback } from 'react';
import { Content } from '@/types';
import { socket } from '@/lib/socket';

export function usePrefetch() {
    const prefetch = useCallback((items: Content[], mediaTypeOverride?: 'movie' | 'tv' | 'anime') => {
        if (!items || items.length === 0) return;

        if (!socket.connected) {
            socket.connect();
        }

        const prefetchData = {
            items: items
                .filter(item => item.id || item.mal_id)
                .map(item => {
                    return {
                        id: (item.mal_id || item.id).toString(),
                        mediaType: mediaTypeOverride || item.media_type || 'movie',
                        title: item.title || item.name
                    };
                })
        };

        socket.emit('prefetch', prefetchData);
    }, []);

    return { prefetch };
}
