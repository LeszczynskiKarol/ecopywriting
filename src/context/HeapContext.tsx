// src/context/HeapContext.tsx
'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useConsent } from './ConsentContext';

interface HeapContextType {
    identify: (userId: string) => void;
    track: (eventName: string, properties?: Record<string, any>) => void;
    addUserProperties: (properties: Record<string, any>) => void;
    resetIdentity: () => void;
}

const HeapContext = createContext<HeapContextType | undefined>(undefined);

export const HeapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { analyticsConsent } = useConsent();

    const identify = useCallback((userId: string) => {
        if (analyticsConsent && window.heap) {
            window.heap.identify(userId);
        }
    }, [analyticsConsent]);

    const track = useCallback((eventName: string, properties?: Record<string, any>) => {
        if (analyticsConsent && window.heap) {
            window.heap.track(eventName, properties);
        }
    }, [analyticsConsent]);

    const addUserProperties = useCallback((properties: Record<string, any>) => {
        if (analyticsConsent && window.heap) {
            window.heap.addUserProperties(properties);
        }
    }, [analyticsConsent]);

    const resetIdentity = useCallback(() => {
        if (analyticsConsent && window.heap) {
            window.heap.resetIdentity();
        }
    }, [analyticsConsent]);

    return (
        <HeapContext.Provider value={{
            identify,
            track,
            addUserProperties,
            resetIdentity
        }}>
            {children}
        </HeapContext.Provider>
    );
};

export const useHeap = () => {
    const context = useContext(HeapContext);
    if (context === undefined) {
        throw new Error('useHeap must be used within a HeapProvider');
    }
    return context;
}; 