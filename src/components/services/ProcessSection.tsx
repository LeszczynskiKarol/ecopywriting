// src/components/services/ProcessSection.tsx
'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, Pencil, Target, Edit, Send } from 'lucide-react';

const steps = [
  {
    title: "Analiza i planowanie",
    description: "Rozpoczynamy od dokładnego zrozumienia Twoich celów, grupy docelowej i tematyki. Tworzymy plan treści dostosowany do Twoich potrzeb.",
    icon: ClipboardList
  },
  {
    title: "Badanie i gromadzenie informacji",
    description: "Przeprowadzamy dogłębne badania, aby zebrać aktualne i wartościowe informacje na temat wybranego tematu.",
    icon: Search
  },
  {
    title: "Tworzenie pierwszej wersji",
    description: "Nasi doświadczeni copywriterzy tworzą pierwszą wersję artykułu, skupiając się na wartościowej treści i angażującym stylu pisania.",
    icon: Pencil
  },
  {
    title: "Optymalizacja SEO",
    description: "Optymalizujemy artykuł pod kątem wybranych słów kluczowych, dbając o naturalność i czytelność tekstu.",
    icon: Target
  },
  {
    title: "Edycja i korekta",
    description: "Nasz zespół redakcyjny dokładnie sprawdza i poprawia artykuł, dbając o poprawność językową i spójność treści.",
    icon: Edit
  },
  {
    title: "Finalizacja i dostarczenie",
    description: "Po ostatecznych poprawkach dostarczamy Ci gotowy artykuł w uzgodnionym formacie, gotowy do publikacji.",
    icon: Send
  }
];

const ProcessSection: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Nasz Proces Tworzenia Artykułów
        </motion.h2>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative mb-8 last:mb-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <div className="w-1/2 px-4">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{step.title}</h3>
                    <p className="text-mg text-gray-600">{step.description}</p>
                  </div>
                </div>
                <motion.div 
                  className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center z-10"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <step.icon className="w-6 h-6 text-green-500" />
                </motion.div>
                <div className="w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;