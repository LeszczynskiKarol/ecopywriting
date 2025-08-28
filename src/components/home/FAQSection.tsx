// src/components/services/FAQSection.tsx
'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Jak długo trwa proces tworzenia artykułu?",
    answer: "Czas realizacji zależy od wybranego pakietu i złożoności tematu. Standardowo, od 2 do 5 dni roboczych."
  },
  {
    question: "Czy mogę prosić o poprawki do artykułu?",
    answer: "Tak, oferujemy rundy poprawek w zależności od wybranego pakietu. Chcemy, abyś był w pełni zadowolony z końcowego rezultatu."
  },
  {
    question: "Jak zapewniacie unikalność treści?",
    answer: "Każdy artykuł jest tworzony od podstaw przez naszych doświadczonych copywriterów. Dodatkowo, sprawdzamy każdy tekst narzędziami do wykrywania plagiatu."
  },
  {
    question: "Czy artykuły są optymalizowane pod SEO?",
    answer: "Tak, wszystkie nasze artykuły są optymalizowane pod kątem SEO, z uwzględnieniem kluczowych fraz i najlepszych praktyk."
  },
  {
    question: "Czy mogę zamówić artykuł na niestandardowy temat?",
    answer: "Oczywiście! Jesteśmy elastyczni i możemy napisać artykuł na dowolny temat zgodny z Twoimi potrzebami."
  },
  {
    question: "Jak wygląda proces współpracy?",
    answer: "Rozpoczynamy od omówienia Twoich potrzeb, następnie tworzymy plan treści, piszemy artykuł, wprowadzamy ewentualne poprawki i dostarczamy gotowy tekst."
  }
];

const FAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Często Zadawane Pytania
        </motion.h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                className="flex justify-between items-center w-full text-left p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300"
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <span className="font-semibold text-gray-800">{faq.question}</span>
                {activeIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-blue-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-500" />
                )}
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white px-4 pb-4 rounded-b-lg"
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;