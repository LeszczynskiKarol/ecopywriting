// src/components/home/RecentArticlesSection.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Article {
    _id: string;
    title: string;
    content: string;
    excerpt?: string;
    featuredImage: string;
    categorySlug: string;
    slug: string;
}

const RecentArticlesSection: React.FC<{ articles: Article[] }> = ({ articles }) => {
    const { theme } = useTheme();

    if (!articles || articles.length === 0) {
        return (
            <section className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="container mx-auto px-4">
                    <h2 className="text-center text-gray-600">Brak artykułów do wyświetlenia</h2>
                </div>
            </section>
        );
    }

    return (
        <section className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="container mx-auto px-4">
                <motion.h2
                    className={`text-3xl md:text-4xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-[#1f2937]'
                        }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Najnowsze artykuły
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article, index) => (
                        <motion.div
                            key={article._id}
                            className={`rounded-lg shadow-md overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                } border-l-4 border-[#38c775]`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        >
                            <Link href={`/blog/${article.categorySlug}/${article.slug}`}>
                                <img
                                    src={article.featuredImage}
                                    alt={article.title}
                                    className="w-full h-48 object-cover"
                                />
                            </Link>
                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-2">
                                    <Link
                                        href={`/blog/${article.categorySlug}/${article.slug}`}
                                        className={`${theme === 'dark'
                                                ? 'text-gray-100 hover:text-[#38c775]'
                                                : 'text-gray-900 hover:text-[#38c775]'
                                            } transition duration-300`}
                                    >
                                        {article.title}
                                    </Link>
                                </h3>
                                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                    {(article.excerpt || '').slice(0, 150)}...
                                </p>
                                <Link
                                    href={`/blog/${article.categorySlug}/${article.slug}`}
                                    className="inline-flex items-center text-[#38c775] hover:text-[#2ea55f] transition duration-300"
                                >
                                    Czytaj więcej
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Link
                        href="/blog"
                        className="inline-flex items-center px-6 py-3 rounded-full text-white bg-[#38c775] hover:bg-[#2ea55f] transition duration-300 shadow-lg hover:shadow-xl"
                    >
                        Zobacz wszystkie artykuły
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RecentArticlesSection;