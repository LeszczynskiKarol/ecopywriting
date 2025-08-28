// src/components/CookieConsent.tsx
'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsent } from '@/context/ConsentContext';
import CookieSettings from '@/components/CookieSettings';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';

const bannerVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 300
        }
    },
    exit: {
        y: 100,
        opacity: 0,
        transition: {
            duration: 0.3
        }
    }
};

const buttonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 300
        }
    },
    exit: {
        scale: 0,
        opacity: 0,
        transition: {
            duration: 0.2
        }
    },
    hover: {
        scale: 1.1,
        transition: {
            duration: 0.2
        }
    },
    tap: {
        scale: 0.95
    }
};

export default function CookieConsent() {
    const {
        updateConsent,
        isMinimized,
        setIsMinimized,
        hasInitialConsent,
        setHasInitialConsent
    } = useConsent();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { theme } = useTheme();

    const handleAcceptAll = () => {
        updateConsent({
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
            clarity_storage: 'granted',
            heap_storage: 'granted'

        });
        setHasInitialConsent(true);
        setIsMinimized(true);
    };

    const handleRejectAll = () => {
        updateConsent({
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            heap_storage: 'denied'
        });
        setHasInitialConsent(true);
        setIsMinimized(true);
    };

    const handleOpenSettings = () => {
        setIsSettingsOpen(true);
        if (!hasInitialConsent) {
            setHasInitialConsent(true);
            setIsMinimized(true);
        }
    };

    if (!hasInitialConsent && !isMinimized) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="consent-banner"
                    variants={bannerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                        } p-4 z-50 shadow-lg border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}
                >
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm">
                            <p>
                                Używamy plików cookie i podobnych technologii w celach:
                            </p>
                            <ul className="list-disc list-inside mt-2">
                                <li>Funkcjonalnych (niezbędne do działania strony)</li>
                                <li>Analitycznych (pomiar ruchu na stronie)</li>
                                <li>Marketingowych (personalizacja reklam)</li>
                            </ul>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOpenSettings}
                                className="text-[#38c775] hover:text-[#2ea55f] underline mt-2"

                            >
                                Dostosuj ustawienia
                            </motion.button>
                        </div>
                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRejectAll}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm text-white transition-colors"

                            >
                                Akceptuj tylko niezbędne
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAcceptAll}
                                className="px-4 py-2 bg-[#38c775] hover:bg-[#2ea55f] rounded-md text-sm text-white transition-colors"
                            >
                                Akceptuj wszystkie
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {(hasInitialConsent || isMinimized) && (
                    <motion.button
                        variants={buttonVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => setIsSettingsOpen(true)}
                        className={`fixed bottom-4 right-4 p-3 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                            } shadow-lg hover:shadow-xl transition-all duration-300 z-50 group`}
                    >
                        <div className="flex items-center">
                            <Cog6ToothIcon className="w-6 h-6" />
                            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out ml-0 group-hover:ml-2">
                                Ustawienia cookie
                            </span>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
            <CookieSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}    