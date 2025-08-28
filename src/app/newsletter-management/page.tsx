// src/app/newsletter-management/page.tsx
import React from 'react';
import Layout from '../../components/layout/Layout';
import NewsletterManagementForm from '../../components/newsletter/NewsletterManagementForm';

const NewsletterManagementPage = () => {
    return (
        <Layout title="Zarządzanie Subskrypcją Newslettera | eCopywriting.pl">
            <div className="max-w-2xl mx-auto py-12">
                <h1 className="text-3xl font-bold mb-6 text-center">Zarządzanie Subskrypcją Newslettera</h1>
                <NewsletterManagementForm />
            </div>
        </Layout>
    );
};

export default NewsletterManagementPage;