// src/app/login/page.tsx
'use client'

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const LoginForm = dynamic(() => import('../../components/auth/LoginForm'), {
  ssr: false,
  loading: () => <p>Ładowanie formularza logowania...</p>
});

export default function LoginPage() {
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
    <Layout title="Logowanie">
      <div className="max-w-md mx-auto my-20">
        <h1 className="text-3xl font-bold mb-5 text-center">Zaloguj się do panelu klienta</h1>
        <LoginForm />
      </div>
    </Layout>
  );
}  