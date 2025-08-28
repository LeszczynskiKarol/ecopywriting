// src/app/verification/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import VerificationCodeInput from '../../components/auth/VerificationCodeInput';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const VerificationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>(''); // Dodajemy stan dla wiadomości
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const router = useRouter();
  const { refreshUserData, user } = useAuth();

  const handleVerification = async (code: string) => {
    setIsLoading(true);
    setError('');
    setMessage(''); // Resetujemy message przy nowej weryfikacji
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/verify-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (response.ok) {
        const token = data.token;
        if (token) {
          console.log('Received token after verification:', token);
          localStorage.setItem('token', token);
          await refreshUserData();
          setIsVerified(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 5000);
        } else {
          console.error('No token received after verification');
          setError('Błąd weryfikacji: brak tokenu');
        }
      } else {
        setError(data.message || 'Wystąpił błąd podczas weryfikacji konta');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setError('Wystąpił błąd podczas weryfikacji konta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    setError(''); // Resetujemy błąd przy nowej próbie
    setMessage(''); // Resetujemy poprzednią wiadomość
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Nowy kod weryfikacyjny został wysłany na Twój adres email.');
      } else {
        setError(data.message || 'Wystąpił błąd podczas wysyłania kodu weryfikacyjnego');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas wysyłania kodu weryfikacyjnego');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Sprawdź czy użytkownik ma token i czy nie jest zweryfikowany
    if (!user || (user && user.isVerified)) {
      router.push('/login');
      return;
    }
  }, [user, router]);



  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md w-full space-y-8">
        {!isVerified ? (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Weryfikacja konta
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Wprowadź kod weryfikacyjny, który został wysłany na Twój adres email
              </p>
            </div>
            <VerificationCodeInput onComplete={handleVerification} />
            {error && (
              <p className="mt-2 text-center text-sm text-red-600">{error}</p>
            )}
            {message && ( // Dodajemy wyświetlanie wiadomości
              <p className="mt-2 text-center text-sm text-green-600">{message}</p>
            )}
            <div className="text-center">
              <button
                onClick={handleResendCode}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Wysyłanie...' : 'Wyślij kod ponownie'}
              </button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-20 h-20 mb-4"
            >
              <svg className="animate-spin h-full w-full text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">Rejestracja zakończona pomyślnie!</h2>
            <p className="text-xl text-gray-700 mb-4">Dziękujemy za założenie konta w eCopywriting.</p>
            <p className="text-lg text-gray-600">Za chwilę nastąpi przekierowanie do panelu klienta.</p>
            <p className="text-lg text-gray-600 mt-4">Życzymy przyjemnego korzystania z panelu!</p>
          </motion.div>
        )}
        {isLoading && !isVerified && (
          <motion.div
            className="flex justify-center items-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VerificationPage;
