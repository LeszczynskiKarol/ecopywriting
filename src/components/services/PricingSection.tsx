// src/components/services/PricingSection.tsx
'use client'

import OrderModal from '../modals/OrderModal';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const features = [
    "Profesjonalni copywriterzy",
    "Optymalizacja SEO",
    "Darmowe poprawki",
    "Szybka realizacja",
    "100% unikalne treści",
    "Szybka realizacja"
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Przejrzyste Ceny, Profesjonalne Treści
        </motion.h2>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            
            <div className="flex items-center justify-center mb-8">
              <span className="text-4xl font-bold text-gray-800">od 18 zł</span>
              <span className="text-gray-500 ml-2">/ 1000 znaków</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
            <motion.button
        className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
      >
        Zamów teraz
      </motion.button>
      <OrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;