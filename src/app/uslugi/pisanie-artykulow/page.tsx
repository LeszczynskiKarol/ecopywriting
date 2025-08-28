// src/app/uslugi/pisanie-artykulow/page.tsx
import React from 'react';
import Layout from '../../../components/layout/Layout';
import HeroSection from '../../../components/services/HeroSection';
import BenefitsSection from '../../../components/services/BenefitsSection';
import ProcessSection from '../../../components/services/ProcessSection';
import PricingSection from '../../../components/services/PricingSection';
import FAQSection from '../../../components/services/FAQSection';
import TestimonialsSection from '../../../components/services/TestimonialsSection';
import CTASection from '../../../components/services/CTASection';

export default function PisanieArtykulowPage() {
  return (
    <Layout title="Profesjonalne Pisanie Artykułów | eCopywriting.pl">
      <HeroSection
        title="Profesjonalne Pisanie Artykułów"
        subtitle="Tworzymy angażujące treści, które przyciągają czytelników i budują autorytet Twojej marki"
        cta="Zamów artykuł"
      />
      <BenefitsSection />
      <ProcessSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
}