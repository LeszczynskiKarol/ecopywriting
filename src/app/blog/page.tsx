// src/app/page.tsx
import React from 'react';
import Layout from '../../components/layout/Layout';
import HeroSection from '../../components/home/HeroSection';
import BenefitsSection from '../../components/home/BenefitsSection';
import ServicesSection from '../../components/home/ServicesSection';
import PricingSection from '../../components/home/PricingSection';
import ProcessSection from '../../components/home/ProcessSection';
import RecentArticlesSection from '../../components/home/RecentArticlesSection';

async function getRecentArticles() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error('Błąd: NEXT_PUBLIC_API_URL nie jest zdefiniowany');
    return [];
  }

  try {
    const res = await fetch(`${apiUrl}/api/articles/recent`, {
      next: { revalidate: 3600 },
      cache: 'force-cache'
    });

    if (!res.ok) {
      console.error('Błąd pobierania artykułów:', await res.text());
      return [];
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Błąd podczas pobierania artykułów:', error);
    return [];
  }
}

export default async function HomePage() {
  let recentArticles = [];
  try {
    recentArticles = await getRecentArticles();
  } catch (error) {
    console.error('Błąd podczas renderowania strony głównej:', error);
  }

  return (
    <Layout title="Usługi Copywriterskie | eCopywriting.pl">
      <HeroSection
        title="Tu powstają Twoje treści"
        subtitle="Copywriting w nowoczesnym wydaniu. Zamawiaj bezobsługowo oryginalne teksty w najlepszych cenach"
        cta="Załóż darmowe konto"
      />
      <BenefitsSection />
      <ProcessSection />
      <ServicesSection />
      <PricingSection />
      <RecentArticlesSection articles={recentArticles} />
    </Layout>
  );
}
