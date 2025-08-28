// src/app/admin/subscribers/page.tsx
'use client'
import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../../components/layout/Layout';

const SubscriberList = dynamic(() => import('./SubscriberList'), {
    ssr: false,
    loading: () => <p>Ładowanie listy subskrybentów...</p>
});

export default function SubscribersPage() {
    return (
        <Layout>
            <SubscriberList />
        </Layout>
    );
}