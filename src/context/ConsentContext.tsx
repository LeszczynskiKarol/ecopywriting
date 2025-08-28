// src/context/ConsentContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

type ConsentSettings = {
    ad_storage: 'granted' | 'denied';
    ad_user_data: 'granted' | 'denied';
    ad_personalization: 'granted' | 'denied';
    analytics_storage: 'granted' | 'denied';
    clarity_storage: 'granted' | 'denied';
    heap_storage: 'granted' | 'denied'; // Dodane dla Heap
};

type ConsentContextType = {
    consentSettings: ConsentSettings;
    updateConsent: (settings: Partial<ConsentSettings>) => void;
    hasAnyConsent: boolean;
    isMinimized: boolean;
    setIsMinimized: (value: boolean) => void;
    hasInitialConsent: boolean;
    setHasInitialConsent: (value: boolean) => void;
    analyticsConsent: boolean;
    clarityConsent: boolean;
    heapConsent: boolean; // Dodane
};

const DEFAULT_CONSENT: ConsentSettings = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    clarity_storage: 'denied',
    heap_storage: 'denied' // Dodane
};

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
    const [consentSettings, setConsentSettings] = useState<ConsentSettings>(DEFAULT_CONSENT);
    const [isMinimized, setIsMinimized] = useState(false);
    const [hasInitialConsent, setHasInitialConsent] = useState(false);

    useEffect(() => {
        try {
            const storedConsent = localStorage.getItem('cookieConsent');
            if (storedConsent) {
                const parsedConsent = JSON.parse(storedConsent);
                setConsentSettings(parsedConsent);
                setHasInitialConsent(true);
                if (typeof window !== 'undefined') {
                    if (window.gtag) {
                        window.gtag('consent', 'update', parsedConsent);
                    }
                    if (window.clarity && parsedConsent.clarity_storage === 'granted') {
                        window.clarity.consent();
                    }
                    // Heap consent handling
                    if (window.heap) {
                        if (parsedConsent.heap_storage === 'granted') {
                            window.heap.load("3811524779");
                        } else {
                            window.heap.resetIdentity();
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading consent settings:', error);
        }
    }, []);

    const updateConsent = (newSettings: Partial<ConsentSettings>) => {
        try {
            const updatedSettings = {
                ...consentSettings,
                ...newSettings
            };

            setConsentSettings(updatedSettings);
            localStorage.setItem('cookieConsent', JSON.stringify(updatedSettings));

            if (typeof window !== 'undefined') {
                if (window.gtag) {
                    window.gtag('consent', 'update', updatedSettings);
                    window.gtag('event', 'consent_update', {
                        consent_settings: updatedSettings
                    });
                }

                if (window.clarity && typeof window.clarity === 'function') {
                    if (updatedSettings.clarity_storage === 'granted') {
                        window.clarity('consent');
                    }
                }

                // Heap consent handling
                if (window.heap) {
                    if (updatedSettings.heap_storage === 'granted') {
                        window.heap.load("3811524779");
                    } else {
                        window.heap.resetIdentity();
                    }
                }
            }
        } catch (error) {
            console.error('Error updating consent settings:', error);
        }
    };

    const hasAnyConsent = Object.values(consentSettings).includes('granted');
    const analyticsConsent = consentSettings.analytics_storage === 'granted';
    const clarityConsent = consentSettings.clarity_storage === 'granted';
    const heapConsent = consentSettings.heap_storage === 'granted';

    return (
        <ConsentContext.Provider value={{
            consentSettings,
            updateConsent,
            hasAnyConsent,
            isMinimized,
            setIsMinimized,
            hasInitialConsent,
            setHasInitialConsent,
            analyticsConsent,
            clarityConsent,
            heapConsent
        }}>
            {children}
        </ConsentContext.Provider>
    );
}

export const useConsent = () => {
    const context = useContext(ConsentContext);
    if (context === undefined) {
        throw new Error('useConsent must be used within a ConsentProvider');
    }
    return context;
};  