// src/components/services/BenefitsSection.tsx
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Award, Users, Lightbulb, BarChart2, Clock, LucideDollarSign } from 'lucide-react';

const benefits = [
  {
    title: "Nowoczesne podejście",
    description: "Zarejestruj się w panelu klienta i zamawiaj teksty błyskawicznie i bezobsługowo. Podaj wytyczne, pobierz fakturę i odbierz gotowe zlecenie!",
    Icon: TrendingUp
  },
  {
    title: "Najwyższe standardy",
    description: "Copywriting to proces kreatywny, ale dla utrzymania najwyższej jakości usług warto odpowiednio łączyć go z procedurami. I właśnie taki sposób tworzymy teksty!",
    Icon: Award
  },
  {
    title: "Doświadczenie",
    description: "Zajmujemy się pisaniem tekstów na zlecenie od 2008 r. Pomagamy w rozwijaniu małych i średnich biznesów, wspieramy duże firmy i mikroprzedsiębiorstwa.",
    Icon: Users
  },
  {
    title: "Kompleksowa realizacja",
    description: "Wystarczy, że podasz wytyczne, a my zajmiemy się całą resztą. Przygotowujemy konspekt, zbieramy materiały źródłowe, odpowiadamy za pisanie, redakcję i korektę treści.",
    Icon: Lightbulb
  },
  {
    title: "Profesjonalna obsługa",
    description: "W panelu klienta masz dostęp do wszystkich tekstów i faktur wystawionych po każdej płatności. Możesz płacić za każde zlecenie lub doładować konto.",
    Icon: BarChart2
  },
  {
    title: "Atrakcyjne ceny",
    description: "W naszym przypadku wysoka jakość idzie w parze z atrakcyjnymi cenami copywritingu. Ceny zaczynają się od 20 zł/1000 zzs., a przy większych zamówienia gwarantujemy rabaty.",
    Icon: DollarSign
  }
];

const BenefitsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dlaczego warto nam zaufać?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                <benefit.Icon className="w-6 h-6 text-[#38c775] mr-2" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{benefit.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;