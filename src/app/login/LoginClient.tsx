// src/app/login/LoginClient.tsx
'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm'
import { useAuth } from '../../context/AuthContext'

export default function LoginClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Dodaj sprawdzenie weryfikacji
      if (!user.isVerified) {
        router.push('/verification');
        return;
      }
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  return <LoginForm />
}  