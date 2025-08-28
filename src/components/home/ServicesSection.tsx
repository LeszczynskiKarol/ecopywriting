// src/components/home/ServicesSection.tsx
'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
    DocumentTextIcon,
    TagIcon,
    ComputerDesktopIcon,
    BookOpenIcon,
    GlobeAltIcon,
    BriefcaseIcon,
    MegaphoneIcon,
    SparklesIcon,
    EnvelopeIcon,
    MagnifyingGlassIcon,
    EnvelopeOpenIcon,
    PencilIcon,
    ClipboardDocumentIcon,
    ChartBarIcon,
    UserGroupIcon,
    CpuChipIcon,
    LightBulbIcon,
} from '@heroicons/react/24/outline';

interface Service {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: string;
}

const services = [
    {
        id: '1',
        title: 'Pisanie artykułów',
        description: 'Tworzymy angażujące artykuły, które przyciągają czytelników i budują autorytet Twojej marki.',
        icon: <DocumentTextIcon className="h-6 w-6" />,
        category: 'Treści',
    },
    {
        id: '2',
        title: 'Opisy produktów',
        description: 'Przekształcamy właściwości produktów w korzyści, które przekonują klientów do zakupu.',
        icon: <TagIcon className="h-6 w-6" />,
        category: 'E-commerce',
    },
    {
        id: '3',
        title: 'Prowadzenie blogów',
        description: 'Regularnie dostarczamy wartościowe treści, które budują lojalną społeczność wokół Twojej marki.',
        icon: <ComputerDesktopIcon className="h-6 w-6" />,
        category: 'Treści',
    },
    {
        id: '4',
        title: 'Tworzenie e-booków',
        description: 'Opracowujemy kompleksowe e-booki, które pozycjonują Ciebie/Twoją firmę jako eksperta w branży.',
        icon: <BookOpenIcon className="h-6 w-6" />,
        category: 'Treści',
    },
    {
        id: '5',
        title: 'Teksty na strony WWW',
        description: 'Tworzymy przekonujące teksty, które skutecznie komunikują wartość Twojej oferty.',
        icon: <GlobeAltIcon className="h-6 w-6" />,
        category: 'Treści',
    },
    {
        id: '6',
        title: 'Oferty sprzedażowe',
        description: 'Przygotowujemy oferty, które podkreślają unikalne korzyści i skłaniają do podjęcia działania.',
        icon: <BriefcaseIcon className="h-6 w-6" />,
        category: 'Sprzedaż',
    },
    {
        id: '7',
        title: 'Teksty marketingowe',
        description: 'Opracowujemy materiały marketingowe skutecznie promujące Twoją markę i produkty.',
        icon: <MegaphoneIcon className="h-6 w-6" />,
        category: 'Marketing',
    },
    {
        id: '8',
        title: 'Hasła i slogany',
        description: 'Tworzymy chwytliwe hasła, które zapadają w pamięć i budują rozpoznawalność marki.',
        icon: <SparklesIcon className="h-6 w-6" />,
        category: 'Branding',
    },
    {
        id: '9',
        title: 'Naming - nazwy',
        description: 'Opracowujemy unikalne i chwytliwe nazwy dla Twoich produktów, usług lub całej firmy.',
        icon: <TagIcon className="h-6 w-6" />,
        category: 'Branding',
    },
    {
        id: '10',
        title: 'E-mail copywriting',
        description: 'Piszemy emaile, które angażują odbiorców i skutecznie konwertują.',
        icon: <EnvelopeIcon className="h-6 w-6" />,
        category: 'Marketing',
    },
    {
        id: '11',
        title: 'Optymalizacja treści SEO',
        description: 'Optymalizujemy istniejące treści, aby poprawić ich widoczność w wynikach wyszukiwania.',
        icon: <MagnifyingGlassIcon className="h-6 w-6" />,
        category: 'SEO',
    },
    {
        id: '12',
        title: 'Pisanie newsletterów',
        description: 'Tworzymy newslettery, które budują relacje z subskrybentami i generują konwersje.',
        icon: <EnvelopeOpenIcon className="h-6 w-6" />,
        category: 'Marketing',
    },
    {
        id: '13',
        title: 'Korekta językowa',
        description: 'Dbamy o poprawność językową Twoich tekstów, eliminując błędy i poprawiając styl.',
        icon: <PencilIcon className="h-6 w-6" />,
        category: 'Redakcja',
    },
    {
        id: '14',
        title: 'Redakcja treści',
        description: 'Udoskonalamy strukturę i formę Twoich tekstów z zachowaniem ich oryginalnego przekazu.',
        icon: <ClipboardDocumentIcon className="h-6 w-6" />,
        category: 'Redakcja',
    },
    {
        id: '15',
        title: 'SEO copywriting',
        description: 'Tworzymy treści zoptymalizowane pod kątem wyszukiwarek, nie zapominając o użytkownikach.',
        icon: <ChartBarIcon className="h-6 w-6" />,
        category: 'SEO',
    },
    {
        id: '16',
        title: 'Artykuły sponsorowane',
        description: 'Przygotowujemy artykuły sponsorowane, które subtelnie promują Twoją markę.',
        icon: <UserGroupIcon className="h-6 w-6" />,
        category: 'Marketing',
    },
    {
        id: '17',
        title: 'Content automation',
        description: 'Wdrażamy rozwiązania automatyzujące tworzenie treści, oszczędzając Twój czas i zasoby.',
        icon: <CpuChipIcon className="h-6 w-6" />,
        category: 'Technologia',
    },
    {
        id: '18',
        title: 'AI copywriting',
        description: 'Wykorzystujemy sztuczną inteligencję do tworzenia innowacyjnych i efektywnych tekstów.',
        icon: <LightBulbIcon className="h-6 w-6" />,
        category: 'Technologia',
    },

];

const categories = [...new Set(services.map(service => service.category))];

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
    const { theme } = useTheme();

    return (
        <motion.div
            className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} transition-all duration-300 ease-in-out`}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
        >
            <div className="flex items-center mb-4">
                <div className="text-[#38c775] mr-4">
                    {service.icon}
                </div>
                <h3 className="text-xl font-semibold">{service.title}</h3>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {service.description}
            </p>
        </motion.div>
    );
};

const ServicesSection: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
    const { theme } = useTheme();

    const filteredServices = selectedCategory === 'Wszystkie'
        ? services
        : services.filter(service => service.category === selectedCategory);

    return (
        <section className={`py-20`}>
            <div className="container mx-auto px-4">
                <motion.h2
                    className={`text-3xl md:text-4xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Nasze usługi
                </motion.h2>
                <div className="flex flex-wrap justify-center mb-8">
                    {['Wszystkie', ...categories].map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`m-2 px-4 py-2 rounded-full transition-colors duration-300 
                                ${selectedCategory === category
                                    ? 'bg-[#38c775] text-white'
                                    : theme === 'dark'
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <AnimatePresence>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {filteredServices.map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <ServiceCard service={service} />
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};

export default ServicesSection;