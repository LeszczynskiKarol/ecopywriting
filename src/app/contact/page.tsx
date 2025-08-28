// src/app/contact/page.tsx
'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ContactForm from './ContactForm';
import BlogLayout from '@/components/layout/BlogLayout';
import CalendarModal from './CalendarModal';
import BackgroundDecoration from '@/components/BackgroundDecoration';

const ContactPage: React.FC = () => {
    const { theme } = useTheme();
    const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);

    return (
        <BlogLayout title="Skontaktuj się z nami">
            <div className="relative">
                <BackgroundDecoration />
                <div className="container mx-auto px-4 py-12 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                        >
                            <h2 className="text-2xl font-semibold mb-6">Formularz kontaktowy</h2>
                            <ContactForm />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                        >
                            <h2 className="text-2xl font-semibold mb-6">Dane firmy</h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center">

                                    <span>kontakt@ecopywriting.pl</span>
                                </div>
                                <div className="flex items-center">
                                    <span>eCopywriting.pl </span>
                                </div>
                                <div className="flex items-center">
                                    <span>86-221 Papowo Biskupie 119/18 </span>
                                </div>
                                <div className="flex items-center">
                                    <span>NIP: 9562203948</span>
                                </div>
                                <div className="flex items-center">
                                    <span>REGON: 340627879</span>
                                </div>

                            </div>

                            <button
                                onClick={() => setCalendarModalOpen(true)}
                                className="flex items-center justify-center w-full px-6 py-3 bg-[#38c775] text-white rounded-full hover:bg-[#2ea55f] transition duration-300"
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                                Umów rozmowę telefoniczną
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>

            <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
        </BlogLayout>
    );
};

export default ContactPage;