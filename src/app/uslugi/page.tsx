// src/app/uslugi/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import ServiceCard from '../../components/services/ServiceCard';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import AnimatedSection from '../../components/AnimatedSection';

interface Service {
  title: string;
  icon: string;
  description: string;
  category: string;
}

interface ServiceGridProps {
  services: Service[];
  category: string;
}

const services: Service[] = [
  {
    title: 'Pisanie artykułów',
    icon: '📝',
    description:
      'Tworzymy angażujące artykuły, które przyciągają czytelników i budują autorytet Twojej marki.',
    category: 'Treści',
  },
  {
    title: 'Opisy produktów',
    icon: '🏷️',
    description:
      'Przekształcamy cechy produktów w korzyści, które przekonują klientów do zakupu.',
    category: 'E-commerce',
  },
  {
    title: 'Prowadzenie blogów',
    icon: '💻',
    description:
      'Regularnie dostarczamy wartościowe treści, które budują lojalną społeczność wokół Twojej marki.',
    category: 'Treści',
  },
  {
    title: 'Tworzenie e-booków',
    icon: '📚',
    description:
      'Opracowujemy kompleksowe e-booki, które pozycjonują Cię jako eksperta w branży.',
    category: 'Treści',
  },
  {
    title: 'Teksty na strony WWW',
    icon: '🌐',
    description:
      'Tworzymy przekonujące teksty, które skutecznie komunikują wartość Twojej oferty.',
    category: 'Treści',
  },
  {
    title: 'Oferty sprzedażowe',
    icon: '💼',
    description:
      'Przygotowujemy oferty, które podkreślają unikalne korzyści i skłaniają do podjęcia działania.',
    category: 'Sprzedaż',
  },
  {
    title: 'Teksty marketingowe',
    icon: '📣',
    description:
      'Opracowujemy materiały marketingowe, które skutecznie promują Twoją markę i produkty.',
    category: 'Marketing',
  },
  {
    title: 'Hasła i slogany',
    icon: '✨',
    description:
      'Tworzymy chwytliwe hasła, które zapadają w pamięć i budują rozpoznawalność marki.',
    category: 'Branding',
  },
  {
    title: 'Naming - nazwy',
    icon: '🏷️',
    description:
      'Opracowujemy unikalne i chwytliwe nazwy dla Twoich produktów, usług lub całej firmy.',
    category: 'Branding',
  },
  {
    title: 'E-mail copywriting',
    icon: '📧',
    description:
      'Piszemy emaile, które angażują odbiorców i skutecznie konwertują.',
    category: 'Marketing',
  },
  {
    title: 'Optymalizacja treści SEO',
    icon: '🔍',
    description:
      'Optymalizujemy istniejące treści, aby poprawić ich widoczność w wynikach wyszukiwania.',
    category: 'SEO',
  },
  {
    title: 'Pisanie newsletterów',
    icon: '📬',
    description:
      'Tworzymy newslettery, które budują relacje z subskrybentami i generują konwersje.',
    category: 'Marketing',
  },
  {
    title: 'Korekta językowa',
    icon: '✏️',
    description:
      'Dbamy o poprawność językową Twoich tekstów, eliminując błędy i poprawiając styl.',
    category: 'Redakcja',
  },
  {
    title: 'Redakcja treści',
    icon: '📋',
    description:
      'Udoskonalamy strukturę i formę Twoich tekstów, zachowując ich oryginalny przekaz.',
    category: 'Redakcja',
  },
  {
    title: 'SEO copywriting',
    icon: '📈',
    description:
      'Tworzymy treści zoptymalizowane pod kątem wyszukiwarek, nie zapominając o użytkownikach.',
    category: 'SEO',
  },
  {
    title: 'Artykuły sponsorowane',
    icon: '🤝',
    description:
      'Przygotowujemy artykuły sponsorowane, które subtelnie promują Twoją markę.',
    category: 'Marketing',
  },
  {
    title: 'Content automation',
    icon: '🤖',
    description:
      'Wdrażamy rozwiązania automatyzujące tworzenie treści, oszczędzając Twój czas i zasoby.',
    category: 'Technologia',
  },
  {
    title: 'AI copywriting',
    icon: '🧠',
    description:
      'Wykorzystujemy sztuczną inteligencję do tworzenia innowacyjnych i efektywnych treści.',
    category: 'Technologia',
  },
];

const categories = Array.from(new Set(services.map((service) => service.category)));

const testimonials = [
  {
    author: 'Jan Kowalski',
    company: 'Tech Solutions Sp. z o.o.',
    content:
      'Współpraca z eCopywriting.pl znacząco poprawiła naszą obecność online. Profesjonalizm i kreatywność na najwyższym poziomie!',
    avatar: '/avatars/jan-kowalski.jpg',
  },
  {
    author: 'Anna Nowak',
    company: 'Eco Store',
    content:
      'Dzięki usługom copywritingowym eCopywriting.pl nasze produkty zaczęły się sprzedawać znacznie lepiej. Polecam!',
    avatar: '/avatars/anna-nowak.jpg',
  },
  {
    author: 'Piotr Wiśniewski',
    company: 'Marketing Pro',
    content:
      'Zespół eCopywriting.pl to prawdziwi profesjonaliści. Ich teksty SEO przyniosły nam znaczący wzrost ruchu organicznego.',
    avatar: '/avatars/piotr-wisniewski.jpg',
  },
];

const ServiceGrid: React.FC<ServiceGridProps> = ({ services, category }) => {
  const filteredServices =
    category === 'Wszystkie'
      ? services
      : services.filter((service) => service.category === category);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredServices.map((service, index) => (
        <motion.div
          key={service.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ServiceCard {...service} />
        </motion.div>
      ))}
    </div>
  );
};


export default function ServicesPage() {
  return (
    <Layout title="Usługi Copywriterskie | eCopywriting.pl">
      <div className="space-y-30">
        <AnimatedSection>
          <div className="bg-gradient-to-b from-primary-50 to-white py-20 px-4 rounded-lg mt-10"> {/* Dodany margines górny mt-6 */}
            <h1 className="text-5xl font-bold mb-10 text-center text-primary-800">
              Usługi copywritingu
            </h1>
            <p className="text-xl text-center mb-8 text-secondary-600 max-w-3xl mx-auto"> {/* Zmniejszony margines dolny z mb-12 na mb-8 */}
              Dostarczamy profesjonalne usługi copywriterskie, które pomagają
              Twojej firmie się wyróżnić i osiągać cele biznesowe. Wybierz
              kategorię, aby zobaczyć nasze specjalizacje.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="bg-white py-1 px-4 rounded-lg"> {/* Usunięto gradient i dodano białe tło */}
            <Tabs defaultValue="Wszystkie" className="w-full">
              <TabsList className="flex justify-center mb-8">
                <TabsTrigger value="Wszystkie">Wszystkie</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="Wszystkie">
                <ServiceGrid services={services} category="Wszystkie" />
              </TabsContent>
              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <ServiceGrid services={services} category={category} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </AnimatedSection>
      </div>
    </Layout>
  );
}