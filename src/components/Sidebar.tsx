// src/components/Sidebar.tsx
'use client'
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Article } from '../types/Article';

interface SidebarProps {
  recentArticles: Article[];
}

const Sidebar: React.FC<SidebarProps> = ({ recentArticles }) => {
  return (
    <aside className="w-full md:w-1/3 lg:w-1/4 px-4">
      <div className="sticky top-16">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Najnowsze artykuły</h2>
        {recentArticles.map((article) => (
          <motion.div
            key={article._id}
            className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300"
            whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            <Link href={`/blog/${article.categorySlug}/${article.slug}`}>
              <img src={article.featuredImage} alt={article.title} className="w-full h-20 object-cover" />
            </Link>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">
                <Link href={`/blog/${article.categorySlug}/${article.slug}`} className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300">
                  {article.title}
                </Link>
              </h3>

            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;