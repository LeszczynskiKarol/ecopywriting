// src/components/home/ProcessSection.tsx
'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, FileText, Receipt, Download, Wallet, MessageCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const steps = [
  {
    title: "Załóż konto",
    description: "Zarejestruj się w serwisie i zaloguj do panela klienta. Założenie konta jest całkowicie darmowe i błyskawiczne.",
    icon: UserPlus
  },
  {
    title: "Złóż zamówienie",
    description: "Przejdź do formularza składania zamówienia, określ wytyczne i przekaż zlecenie pisania tekstów do realizacji.",
    icon: FileText
  },
  {
    title: "Odbierz fakturę",
    description: "Po każdej płatności otrzymujesz fakturę na dane wskazane w Twoim profilu w panelu klienta.",
    icon: Receipt
  },
  {
    title: "Odbierz teksty",
    description: "Po wykonaniu zlecenia otrzymujesz wiadomość email i powiadomienie w panelu klienta, gdzie możesz pobrać zamówione treści.",
    icon: Download
  },
  {
    title: "Doładowuj konto i zamawiaj taniej",
    description: "Dzięki doładowniu konta możesz oszczędzić nawet 20% na copywritingu! Swoje środki możesz wykorzystać w dowolnym momencie.",
    icon: Wallet
  },
  {
    title: "Pozostańmy w kontakcie",
    description: "Jeśli chcesz nawiązać szerszą współpracę lub masz jakiekolwiek pytania na temat copywritingu, skontaktuj się z nami w panelu klienta albo napisz wiadomość.",
    icon: MessageCircle
  }
];

const ProcessSection: React.FC = () => {
  const { theme } = useTheme();
  return (
    <section className={`py-10 md:py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <motion.h2
          className={`text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 ${theme === 'dark' ? 'text-white' : 'text-[#1f2937]'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Jak zamawiać teksty
        </motion.h2>
        <div className="relative">
          <div className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative mb-8 last:mb-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
                  <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#1f2937]'}`}>{step.title}</h3>
                    <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{step.description}</p>
                  </div>
                </div>
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${theme === 'dark' ? 'bg-[#2ea55f]' : 'bg-[#38c775]'}`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <step.icon className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-white'}`} />
                </motion.div>
                <div className="hidden md:block w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;