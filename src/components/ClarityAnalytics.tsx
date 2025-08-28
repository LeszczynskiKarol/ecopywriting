// src/components/ClarityAnalytics.tsx
'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { useConsent } from '../context/ConsentContext';

const ClarityAnalytics = () => {
    const { clarityConsent } = useConsent();
    const isInitialized = useRef(false);

    // Główny skrypt inicjalizacyjny Clarity
    const clarityScript = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "p48kn5b5ym");
    `;

    useEffect(() => {
        if (clarityConsent && !isInitialized.current) {
            const initClarity = () => {
                try {
                    if (typeof window.clarity === 'function') {
                        window.clarity('consent');
                        isInitialized.current = true;
                        console.log('Clarity initialized successfully');
                    } else {
                        console.log('Waiting for Clarity to load...');
                        setTimeout(initClarity, 1000);
                    }
                } catch (error) {
                    console.error('Error initializing Clarity:', error);
                }
            };

            initClarity();
        }

        return () => {
            isInitialized.current = false;
        };
    }, [clarityConsent]);

    if (!clarityConsent) {
        return null;
    }

    return (
        <>
            <Script
                id="microsoft-clarity"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: clarityScript }}
                onLoad={() => {
                    console.log('Clarity script loaded');
                    if (typeof window.clarity === 'function') {
                        window.clarity('consent');
                    }
                }}
                onError={(e) => {
                    console.error('Error loading Clarity script:', e);
                }}
            />
            <Script
                id="clarity-meta"
                strategy="beforeInteractive"
            >{`
                window.clarity = window.clarity || function(){(window.clarity.q = window.clarity.q || []).push(arguments)};
            `}</Script>
        </>
    );
};

export default ClarityAnalytics; 