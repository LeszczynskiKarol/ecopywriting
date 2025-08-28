// src/app/dashboard/new-order/page.tsx
'use client';
import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import dynamic from 'next/dynamic';

const OrderForm = dynamic(() => import('../../../components/dashboard/OrderForm'), {
  loading: () => <Loader />,
  ssr: false
});

const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const NewOrderPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Nowe zamówienie</h1>
      <Suspense fallback={<Loader />}>
        <OrderForm />
      </Suspense>
    </div>
  );
};

export default NewOrderPage;