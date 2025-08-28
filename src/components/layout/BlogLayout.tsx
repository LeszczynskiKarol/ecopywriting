// src/components/layout/BlogLayout.tsx
import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';

interface BlogLayoutProps {
    children: React.ReactNode;
    title: string;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({ children, title }) => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <div className="flex flex-col min-h-screen">
                    <Head>
                        <title>{title}</title>
                        <meta
                            name="description"
                            content="Blog eCopywriting.pl - Najnowsze trendy, porady i inspiracje ze świata copywritingu i content marketingu."
                        />
                        <link rel="icon" href="/favicon.ico" />
                    </Head>
                    <Header />
                    <main className="flex-grow">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                            <h1 className="text-4xl font-bold mb-8 text-center text-primary-800">{title}</h1>
                            {children}
                        </div>
                    </main>
                    <Footer />
                </div>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default BlogLayout;