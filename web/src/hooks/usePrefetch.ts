import { useCallback } from 'react';
import { Content } from '@/types';

export function usePrefetch() {
    const prefetch = useCallback((items: Content[], mediaTypeOverride?: 'movie' | 'tv' | 'anime') => {
        if (!items || items.length === 0) return;

        const prefetchData = {
            items: items
                .filter(item => item.id || item.mal_id)
                .map(item => ({
                    id: (item.mal_id || item.id).toString(),
                    mediaType: mediaTypeOverride || item.media_type || 'movie',
                    title: item.title || item.name
                }))
        };

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/streams/prefetch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(prefetchData),
        }).catch(err => console.error('Prefetch error:', err));
    }, []);

    return { prefetch };
}
