// src/app/page.tsx
import React from 'react';
import { Metadata } from 'next'
import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import BenefitsSection from '../components/home/BenefitsSection';
import ServicesSection from '../components/home/ServicesSection';
import PricingSection from '../components/home/PricingSection';
import ProcessSection from '../components/home/ProcessSection';
import RecentArticlesSection from '../components/home/RecentArticlesSection';
// import VideoSection from '../components/home/VideoSection';

export const metadata: Metadata = {
  title: 'Pisanie tekstów - copywriting na zamówienie. Tworzenie treści na zlecenie',
  description: 'Tworzymy angażujące treści, które przyciągają czytelników i budują autorytet Twojej marki. Sprawdź nasze usługi copywritingu i content marketingu.',
  keywords: 'copywriting, content marketing, teksty na stronę, artykuły sponsorowane, copywriter',
  openGraph: {
    title: 'Pisanie tekstów - copywriting na zamówienie. Tworzenie treści na zlecenie',
    description: 'Tworzymy angażujące treści, które przyciągają czytelników i budują autorytet Twojej marki.',
    url: 'https://ecopywriting.pl',
    siteName: 'eCopywriting.pl',
    images: [
      {
        url: 'https://s3.eu-north-1.amazonaws.com/ecopywriting.pl/logos/logo_for_schema_seo.png',
        width: 1800,
        height: 372,
        alt: 'eCopywriting.pl - Profesjonalne usługi copywriterskie',
      },
    ],
    locale: 'pl_PL',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'twój-kod-weryfikacyjny-google',
  },
  alternates: {
    canonical: 'https://ecopywriting.pl',
  }
}


async function getRecentArticles() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.error('Błąd: NEXT_PUBLIC_API_URL nie jest zdefiniowany');
    return [];
  }

  try {


    const res = await fetch(`${apiUrl}/api/articles/recent`, {

      next: { revalidate: 3600 },
      cache: 'force-cache' // dodajemy cache
    });


    if (!res.ok) {
      console.error('Błąd pobierania artykułów:', await res.text());
      return []; // zwracamy pustą tablicę zamiast rzucania błędu
    }


    const data = await res.json();


    return data.data || [];
  } catch (error) {
    console.error('Błąd podczas pobierania artykułów:', error);
    return []; // obsługa błędów
  }
}



export default async function HomePage() {


  let recentArticles = [];

  try {
    recentArticles = await getRecentArticles();

  } catch (error) {
    console.error('Błąd podczas renderowania strony głównej:', error);
  }

  // Sprawdź czy recentArticles ma prawidłową strukturę


  return (
    <Layout title="Usługi Copywriterskie | eCopywriting.pl">
      <HeroSection
        title="Tu powstają Twoje treści"
        subtitle="Copywriting w nowoczesnym wydaniu. Załóż konto i zamawiaj oryginalne teksty w najlepszych cenach."
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