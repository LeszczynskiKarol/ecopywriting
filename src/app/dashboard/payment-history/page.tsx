// src/app/dashboard/payment-history/page.tsx
'use client';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const PaymentHistory = dynamic(() => import('../../../components/dashboard/PaymentHistory'), {
    loading: () => <Loader />,
    ssr: false
});

const Loader = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

export default function PaymentHistoryPage() {
    return (
        <div>
            <Suspense fallback={<Loader />}>
                <PaymentHistory />
            </Suspense>
        </div>
    );
}