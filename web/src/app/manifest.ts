import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'StreamHub',
        short_name: process.env.NEXT_PUBLIC_APP_NAME || 'StreamHub',
        description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Unlimited streaming of Movies, TV Shows, and Anime.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#e50914',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
