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
    <motion.div
      className="bg-white border border-primary-100 rounded-lg p-6 shadow-md transition-all duration-300 h-full flex flex-col justify-between"
      whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
    >
      <div>
        <motion.div
          className="text-4xl mb-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-semibold mb-2 text-primary-700">{title}</h3>
        <p className="text-secondary-600 mb-4">{description}</p>
      </div>
      <div>
        <span className="inline-block bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
          {category}
        </span>
        <Link
          href={`/uslugi/${title.toLowerCase().replace(/ /g, '-')}`}
          className="inline-block mt-2 text-primary-600 hover:text-primary-800 transition-colors duration-300"
        >
          Dowiedz się więcej →
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
