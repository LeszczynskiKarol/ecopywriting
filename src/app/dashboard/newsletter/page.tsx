// src/app/dashboard/newsletter/page.tsx
'use client';
import React, { Suspense, lazy } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const NewsletterPreferences = lazy(() => import('../../../components/newsletter/NewsletterPreferences'));
const NewsletterHistory = lazy(() => import('../../../components/newsletter/NewsletterHistory'));

const Loader = () => (
    <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
);

export default function NewsletterPage() {
    const { theme } = useTheme();

    return (
        <div className={`space-y-8 ${theme === 'dark' ? 'dark' : ''}`}>
            <h1 className="text-3xl font-bold mb-6 dark:text-white">Zarządzanie mailingiem</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Suspense fallback={<Loader />}>
                        <NewsletterPreferences />
                    </Suspense>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4 dark:text-white">Historia</h2>
                    <Suspense fallback={<Loader />}>
                        <NewsletterHistory />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}