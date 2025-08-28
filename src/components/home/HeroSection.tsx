// src/components/home/HeroSection.tsx
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Percent } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  cta: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, cta }) => {
  const benefits = [
    "Zlecaj i pobieraj teksty w jednym miejscu",
    "Ozczędzaj czas dzięki bezkontaktowym zamówieniom",
    "Oszczędzaj pieniądze dzięki atrakcyjnym cenom"
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24">
      <div className="relative container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <motion.div
            className="lg:w-1/2 mb-10 lg:mb-0 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-5xl font-extrabold text-[#1f2937] dark:text-white leading-tight mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {subtitle}
            </p>
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#38c775] mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
            <Link href="/register" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#38c775] hover:bg-[#2ea55f] transition duration-300 ease-in-out shadow-lg hover:shadow-xl">
              {cta}
              <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
            </Link>
          </motion.div>
          <motion.div
            className="lg:w-1/2 lg:pl-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-[#38c775]">
              <h2 className="text-2xl font-bold mb-4 text-[#1f2937] dark:text-white">Załóż darmowe konto i zyskaj zniżki!</h2>
              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <Percent className="w-5 h-5 text-[#38c775] mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">-20% przy zamówieniu +500 zł</span>
                </div>
                <div className="flex items-center">
                  <Percent className="w-5 h-5 text-[#38c775] mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">-10% przy zamówieniu +200 zł</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-[#f5f9ff] dark:bg-gray-700 rounded">
                Cena regularna: <span className="font-semibold">20 zł / 1000 znaków</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;