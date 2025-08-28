// src/app/error.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';

export default function ErrorPage({
  error,
  reset,
}: {
  error?: Error;
  reset?: () => void;
}) {
  return (
    <Layout title="Błąd | eCopywriting.pl">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ups! Coś poszło nie tak
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Przepraszamy, wystąpił tymczasowy problem z dostępem do strony.
            Pracujemy nad jego rozwiązaniem.
          </p>
          <div className="space-y-4">
            {reset && (
              <button
                onClick={reset}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mx-2"
              >
                Spróbuj ponownie
              </button>
            )}
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mx-2"
            >
              Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}