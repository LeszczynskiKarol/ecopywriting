// src/app/blog/[category]/CategoryClient.tsx
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { Article } from '@/types/Article';

interface CategoryClientProps {
  articles: Article[];
  category: string;
}

const CategoryClient: React.FC<CategoryClientProps> = ({ articles, category }) => {
  const { theme } = useTheme();

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className={`text-2xl ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          Brak artykułów w tej kategorii
        </h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Artykuły w kategorii: {category}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, index) => (
          <motion.div
            key={article._id}
            className={`rounded-lg shadow-md overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
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
                    ? 'text-gray-100 hover:text-blue-400'
                    : 'text-gray-900 hover:text-blue-600'
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
                className="inline-flex items-center text-blue-500 hover:text-blue-600 transition duration-300"
              >
                Czytaj więcej
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryClient;