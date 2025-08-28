// src/components/GoogleAnalytics.tsx
'use client';
import { useEffect } from 'react';
import Script from 'next/script';
import { useAuth } from '../context/AuthContext';

export default function GoogleAnalytics() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const analyticsScript = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    // Wykrywanie regionu EU
    const isEU = navigator.language.toLowerCase().includes('pl') || 
                 navigator.language.toLowerCase().startsWith('de');

    // Ustawienia domyślne dla EU
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'region': ['EU'],
        'wait_for_update': 2000
    });

    // Włączenie debugowania tylko dla adminów
    gtag('set', 'debug_mode', ${isAdmin});

    // Oznaczanie ruchu admina jako wewnętrzny
    ${isAdmin ? "gtag('set', 'user_properties', {'traffic_type': 'internal'});" : ''}

    // Włączenie URL passthrough
    gtag('set', 'url_passthrough', true);

    // Włączenie redakcji danych reklamowych
    gtag('set', 'ads_data_redaction', true);

    gtag('js', new Date());
    gtag('config', 'G-LJEB54X9P5', {
        debug_mode: ${isAdmin},
        send_page_view: true,
        ${isAdmin ? "'traffic_type': 'internal'," : ''}
    });
  `;

  // Debugowanie dla adminów
  useEffect(() => {
    if (isAdmin && typeof window !== 'undefined') {
      console.log('🔧 Analytics w trybie administratora - ruch oznaczony jako wewnętrzny');
    }
  }, [isAdmin]);

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-LJEB54X9P5"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {analyticsScript}
      </Script>
    </>
  );
} 