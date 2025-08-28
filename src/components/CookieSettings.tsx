// src/components/CookieSettings.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsent } from '@/context/ConsentContext';
import { useTheme } from '@/context/ThemeContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

type CookieSettingsProps = {
    isOpen: boolean;
    onClose: () => void;
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 300
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95
    }
};

export default function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
    const { consentSettings, updateConsent } = useConsent();
    const { theme } = useTheme();
    const [tempSettings, setTempSettings] = useState<typeof consentSettings>(consentSettings);

    useEffect(() => {
        if (isOpen) {
            setTempSettings(consentSettings);
        }
    }, [isOpen, consentSettings]);

    const handleToggle = (key: keyof typeof consentSettings) => {
        setTempSettings(prev => ({
            ...prev,
            [key]: prev[key] === 'granted' ? 'denied' : 'granted'
        }));
    };

    const handleSave = () => {
        updateConsent(tempSettings);
        onClose();
    };


    return (
        <AnimatePresence>
            {isOpen && (

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                            } rounded-lg p-6 max-w-md w-full mx-4 relative`}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold mb-4">Ustawienia prywatności</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Niezbędne pliki cookie</h3>
                                    <p className="text-sm text-gray-500">
                                        Wymagane do działania podstawowych funkcji witryny
                                    </p>
                                </div>
                                <input type="checkbox" checked disabled className="h-5 w-5" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Analiza ruchu (analytics_storage)</h3>
                                    <p className="text-sm text-gray-500">
                                        Pomaga nam zrozumieć, jak użytkownicy korzystają z witryny
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={tempSettings.analytics_storage === 'granted'}
                                    onChange={() => handleToggle('analytics_storage')}
                                    className="h-5 w-5 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Dane reklamowe (ad_storage)</h3>
                                    <p className="text-sm text-gray-500">
                                        Pozwala na mierzenie skuteczności reklam
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={tempSettings.ad_storage === 'granted'}
                                    onChange={() => handleToggle('ad_storage')}
                                    className="h-5 w-5 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Dane użytkownika (ad_user_data)</h3>
                                    <p className="text-sm text-gray-500">
                                        Używane do personalizacji reklam
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={tempSettings.ad_user_data === 'granted'}
                                    onChange={() => handleToggle('ad_user_data')}
                                    className="h-5 w-5 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Personalizacja (ad_personalization)</h3>
                                    <p className="text-sm text-gray-500">
                                        Pozwala na wyświetlanie spersonalizowanych reklam
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={tempSettings.ad_personalization === 'granted'}
                                    onChange={() => handleToggle('ad_personalization')}
                                    className="h-5 w-5 cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Microsoft Clarity (clarity_storage)</h3>
                                    <p className="text-sm text-gray-500">
                                        Pomaga nam analizować zachowania użytkowników i ulepszać stronę
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={tempSettings.clarity_storage === 'granted'}
                                    onChange={() => handleToggle('clarity_storage')}
                                    className="h-5 w-5 cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Heap Analytics (heap_storage)</h3>
                                    <p className="text-sm text-gray-500">
                                        Pomaga nam analizować interakcje użytkowników i ulepszać funkcjonalności
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={tempSettings.heap_storage === 'granted'}
                                    onChange={() => handleToggle('heap_storage')}
                                    className="h-5 w-5 cursor-pointer"
                                />
                            </div>


                        </div>


                        <motion.div
                            className="mt-6 flex justify-end gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 ${theme === 'dark'
                                    ? 'bg-gray-700 hover:bg-gray-600'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    } rounded-md transition-colors`}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-[#38c775] hover:bg-[#2ea55f] rounded-md text-sm text-white transition-colors"
                            >
                                Zapisz ustawienia
                            </button>
                        </motion.div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}   