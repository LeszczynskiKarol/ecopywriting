// src/components/layout/ArticleLayout.tsx
import React from 'react';
import Layout from './Layout';
import Sidebar from '@/components/Sidebar';
import { Article } from '@/types/Article';

interface ArticleLayoutProps {
    children: React.ReactNode;
    title: string;
    recentArticles: Article[];
}

const ArticleLayout: React.FC<ArticleLayoutProps> = ({ children, title, recentArticles }) => {
    return (
        <Layout title={title}>
            <div className="container mx-auto px-4 py-20 flex flex-wrap">
                <main className="w-full md:w-2/3 lg:w-3/4 pr-4">
                    {children}
                </main>
                <Sidebar recentArticles={recentArticles} />
            </div>
        </Layout>
    );
};

export default ArticleLayout;