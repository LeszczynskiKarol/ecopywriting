// src/components/ClarityTest.tsx
'use client';

import { useEffect, useState } from 'react';
import { useConsent } from '../context/ConsentContext';

const ClarityTest = () => {
    const { clarityConsent } = useConsent();
    const [clarityStatus, setClarityStatus] = useState<string>('Checking...');

    useEffect(() => {
        const checkClarity = () => {
            if (!window.clarity) {
                setClarityStatus('Clarity object not found');
                return;
            }

            try {
                // Test event
                window.clarity.set('test_event', 'test_value');
                setClarityStatus('Clarity is working! Check console for details.');
            } catch (error) {
                setClarityStatus(`Clarity error: ${error}`);
            }
        };

        if (clarityConsent) {
            // Daj czas na inicjalizację
            setTimeout(checkClarity, 2000);
        } else {
            setClarityStatus('Clarity consent not granted');
        }
    }, [clarityConsent]);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                padding: '10px',
                background: '#f0f0f0',
                borderRadius: '5px',
                zIndex: 9999,
                fontSize: '12px'
            }}
        >
            Clarity Status: {clarityStatus}
        </div>
    );
};

export default ClarityTest; 