// src/components/services/ServiceCard.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  icon: string;
  description: string;
  category: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  icon,
  description,
  category,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <motion.div
        className="border border-gray-200 dark:border-gray-700 p-6 shadow-md transition-all duration-300 h-full flex flex-col justify-between"
        whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
      >
        <div>
          <motion.div
            className="text-4xl mb-4 text-primary-600 dark:text-primary-400"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        </div>
        <div>
          <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
            {category}
          </span>
          <Link
            href={`/uslugi/${title.toLowerCase().replace(/ /g, '-')}`}
            className="inline-block mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors duration-300"
          >
            Dowiedz się więcej →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ServiceCard;