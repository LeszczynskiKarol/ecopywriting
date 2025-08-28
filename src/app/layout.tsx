// src/app/layout.tsx
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import CookieConsent from '@/components/CookieConsent';
import { ThemeProvider } from '../context/ThemeContext';
import { ConsentProvider } from '../context/ConsentContext';
import { HeapProvider } from '../context/HeapContext';
import { LoaderProvider } from '../context/LoaderContext';
import BackgroundDecoration from '@/components/BackgroundDecoration';
import GlobalLoader from '@/components/GlobalLoader';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import HeapAnalytics from '@/components/HeapAnalytics';
import ClarityAnalytics from '@/components/ClarityAnalytics';
import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <meta name="clarity-tracking" content="true" />
        <meta name="clarity-domain-whitelist" content="ecopywriting.pl" />
      </head>
      <body>
        <ConsentProvider>
          <ThemeProvider>
            <AuthProvider>
              <HeapProvider>
                <LoaderProvider>
                  <GoogleAnalytics />
                  <HeapAnalytics />
                  <ClarityAnalytics />
                  <BackgroundDecoration />
                  <GlobalLoader />
                  {children}
                  <CookieConsent />
                </LoaderProvider>
              </HeapProvider>
            </AuthProvider>
          </ThemeProvider>
        </ConsentProvider>
      </body>
    </html>
  );
} 