// src/components/services/HeroSection.tsx
'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Pen, Book, Users } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  cta: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, cta }) => {
  const benefits = [
    "Zwiększony ruch organiczny",
    "Budowa autorytetu marki",
    "Większe zaangażowanie odbiorców"
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50 py-20 sm:py-32">
       <div className="relative container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <motion.div 
            className="lg:w-1/2 mb-10 lg:mb-0 bg-white bg-opacity-90 p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {subtitle}
            </p>
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
            <Link href="/kontakt" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary-dark transition duration-300 ease-in-out shadow-lg hover:shadow-xl">
              {cta}
              <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
            </Link>
          </motion.div>
          <div className="lg:w-1/2">
            <motion.div
              className="relative w-full h-full min-h-[300px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="rgba(59, 130, 246, 0.1)" d="M44.7,-76.4C58.8,-69.8,71.8,-59.1,79.6,-45.3C87.4,-31.5,90,-14.7,88.5,1.5C87,17.7,81.4,33.4,73.4,47.9C65.4,62.4,55,75.7,41.6,82.5C28.2,89.3,11.9,89.6,-3.4,85.2C-18.7,80.8,-33,71.6,-46.8,62.2C-60.6,52.8,-73.9,43.2,-79.5,30.1C-85.1,17,-83,0.5,-79.6,-15.3C-76.2,-31.1,-71.5,-46.2,-61.7,-56.8C-51.9,-67.4,-37,-73.5,-22.8,-76.9C-8.5,-80.3,5,-81,17.8,-78.5C30.6,-76,42.6,-70.4,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-8">
                    <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center">
                      <Pen className="w-12 h-12 text-primary mb-2" />
                      <span className="text-sm font-medium">Kreatywne Teksty</span>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center">
                      <Book className="w-12 h-12 text-primary mb-2" />
                      <span className="text-sm font-medium">Ekspercka Wiedza</span>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-primary mb-2" />
                      <span className="text-sm font-medium">Zaangażowanie</span>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2">
                        100%
                      </div>
                      <span className="text-sm font-medium">Satysfakcji</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;