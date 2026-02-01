'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/context/ThemeProvider';
import Header from './Header';

export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <Header />
            <main>{children}</main>
        </ThemeProvider>
    );
}
