// src/components/services/BenefitsSection.tsx
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Users, Lightbulb, BarChart2, Clock } from 'lucide-react';

const benefits = [
  {
    title: "Zwiększony ruch organiczny",
    description: "Nasze artykuły są optymalizowane pod kątem SEO, co pomaga przyciągnąć więcej odwiedzających z wyszukiwarek.",
    Icon: TrendingUp
  },
  {
    title: "Budowa autorytetu marki",
    description: "Wysokiej jakości treści pozycjonują Twoją firmę jako eksperta w branży, budując zaufanie wśród klientów.",
    Icon: Award
  },
  {
    title: "Większe zaangażowanie odbiorców",
    description: "Tworzymy angażujące artykuły, które zachęcają czytelników do dłuższego pozostania na stronie i interakcji z Twoją marką.",
    Icon: Users
  },
  {
    title: "Wsparcie w decyzjach zakupowych",
    description: "Nasze treści edukują klientów o Twoich produktach lub usługach, ułatwiając im podjęcie decyzji o zakupie.",
    Icon: Lightbulb
  },
  {
    title: "Poprawa konwersji",
    description: "Strategicznie umieszczone wezwania do działania w artykułach pomagają przekształcić czytelników w klientów.",
    Icon: BarChart2
  },
  {
    title: "Oszczędność czasu",
    description: "Zajmujemy się całym procesem tworzenia treści, pozwalając Ci skupić się na innych aspektach Twojego biznesu.",
    Icon: Clock
  }
];

const BenefitsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Korzyści z Profesjonalnego Pisania Artykułów
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                <benefit.Icon className="w-6 h-6 text-green-500 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">{benefit.title}</h3>
              </div>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;