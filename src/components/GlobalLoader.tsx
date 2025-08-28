// src/components/GlobalLoader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';

const GlobalLoader = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleComplete = () => setLoading(false);

        handleComplete(); // Reset loading state on initial load or navigation

        window.addEventListener('beforeunload', handleStart);
        window.addEventListener('load', handleComplete);

        return () => {
            window.removeEventListener('beforeunload', handleStart);
            window.removeEventListener('load', handleComplete);
        };
    }, [pathname, searchParams]);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className={`w-16 h-16 border-4 border-t-4 rounded-full animate-spin ${theme === 'dark' ? 'border-white border-t-gray-800' : 'border-gray-800 border-t-white'}`}></div>
        </div>
    );
};

export default GlobalLoader;