// src/components/layout/Layout.tsx
import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'eCopywriting.pl',
  description = 'Profesjonalne usługi copywriterskie dla Twojego biznesu'
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={description}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;