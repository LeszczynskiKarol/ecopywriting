// src/components/services/CTASection.tsx
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-primary-50 opacity-50" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Gotowy na profesjonalne artykuły, które wyróżnią Twoją markę?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Nie czekaj, zacznij przyciągać więcej klientów już dziś dzięki wysokiej jakości treściom.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              href="/kontakt" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary-dark transition duration-300 ease-in-out shadow-lg hover:shadow-xl"
            >
              Zamów artykuł
              <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;