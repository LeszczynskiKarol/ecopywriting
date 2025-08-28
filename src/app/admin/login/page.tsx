// src/app/admin/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  // Dodaj style do ukrycia badge'a
  const badgeStyle = `
    .grecaptcha-badge { 
      visibility: hidden;
    }
  `;

  // Dodaj skrypt reCAPTCHA przy montowaniu komponentu
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = badgeStyle;
    document.head.appendChild(styleElement);

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      const badges = document.getElementsByClassName('grecaptcha-badge');
      while (badges.length > 0) {
        badges[0].remove();
      }
      if ('grecaptcha' in window) {
        (window as any).grecaptcha = undefined;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Wykonaj weryfikację reCAPTCHA
      const recaptchaResponse = await new Promise<string>((resolve, reject) => {
        if (!window.grecaptcha) {
          reject(new Error('reCAPTCHA nie jest załadowana'));
          return;
        }

        window.grecaptcha.ready(() => {
          window.grecaptcha!.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
            { action: 'admin_login' }
          )
            .then(resolve)
            .catch(reject);
        });
      });

      const success = await login(email, password, recaptchaResponse);
      if (success) {
        router.push('/admin/dashboard');
      } else {
        setError('Nieprawidłowe dane logowania');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas logowania');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Panel Admina - Logowanie</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">
            Hasło
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Zaloguj
        </button>
        <div className="text-xs text-gray-500 text-center mt-4">
          <p>Formularz zabezpieczony za pomocą Google reCAPTCHA{' '}</p>
          <a href="https://policies.google.com/privacy" className="text-blue-500">Privacy Policy</a>{' '}, {' '}
          <a href="https://policies.google.com/terms" className="text-blue-500">Terms of Service</a>{' '}
        </div>
      </form>
    </div>
  );
}