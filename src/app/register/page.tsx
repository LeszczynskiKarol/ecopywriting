// src/app/register/page.tsx
'use client'

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const RegisterForm = dynamic(() => import('../../components/auth/RegisterForm'), {
  ssr: false,
  loading: () => <p>Ładowanie formularza rejestracji...</p>
});

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (!user.isVerified) {
        router.push('/verification');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <Layout title="Rejestracja">
      <div className="max-w-md mx-auto my-20">
        <h1 className="text-3xl font-bold mb-5 text-center">Załóż konto klienta</h1>
        <RegisterForm />
      </div>
    </Layout>
  );
} 