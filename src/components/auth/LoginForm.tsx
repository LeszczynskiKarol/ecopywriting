// src/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { analyticsEvents, isUserAdmin } from '../../utils/analytics';
import { useHeap } from '../../context/HeapContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HEAP_EVENTS } from '../../constants/analytics';
import { useAuth } from '../../context/AuthContext';
import { useConsent } from '../../context/ConsentContext';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LoginForm: React.FC = () => {
  const { track, identify, addUserProperties } = useHeap();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, fetchUnreadNotificationsCount } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const { clarityConsent } = useConsent();

  const badgeStyle = `
  .grecaptcha-badge { 
    visibility: hidden;
  }
`;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    track(HEAP_EVENTS.LOGIN.START);

    try {
      if (!window.grecaptcha) {
        throw new Error('reCAPTCHA nie została załadowana poprawnie. Odśwież stronę i spróbuj ponownie.');
      }

      const recaptchaToken = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
        { action: 'login' }
      );

      const success = await login(email, password, recaptchaToken);

      if (success) { // Usuwamy warunek sprawdzający user
        await fetchUnreadNotificationsCount();

        // Heap analytics
        if (user) { // Sprawdzamy czy user istnieje
          identify(user.id);
          addUserProperties({
            email: email,
            isAdmin: isUserAdmin(user),
            lastLoginDate: new Date().toISOString(),
            lastLoginMethod: 'email'
          });

          // Clarity tracking - przenosimy do bloku if (user)
          if (window.clarity && clarityConsent) {
            try {
              window.clarity.identify(user.id, {
                email: email,
                isAdmin: isUserAdmin(user),
                lastLoginDate: new Date().toISOString()
              });
              window.clarity.set('userType', isUserAdmin(user) ? 'admin' : 'user');
              window.clarity.set('loginMethod', 'email');
            } catch (error) {
              console.error('Error while setting Clarity properties:', error);
            }
          }
        }

        analyticsEvents.loginSuccess(email, isUserAdmin(user));
        track(HEAP_EVENTS.LOGIN.SUCCESS);

        router.push('/dashboard');
      } else {
        analyticsEvents.loginError('Nieprawidłowe dane logowania');
        track(HEAP_EVENTS.LOGIN.ERROR, {
          reason: 'Invalid credentials',
          email: email
        });

        // Clarity tracking dla błędów
        if (window.clarity && clarityConsent) {
          try {
            window.clarity.set('loginError', 'Invalid credentials');
            window.clarity.set('errorEmail', email); // dodajemy email do śledzenia błędów
          } catch (error) {
            console.error('Error while setting Clarity error properties:', error);
          }
        }

        setError('Logowanie nie powiodło się. Sprawdź swoje dane.');
      }

    } catch (error: any) {

      console.error(error);
      const errorMessage = error.message || 'Nieznany błąd';
      track(HEAP_EVENTS.LOGIN.ERROR, {
        reason: errorMessage,
        errorType: error.name
      });
      analyticsEvents.loginError(errorMessage);

      if (error.message.includes('reCAPTCHA')) {
        setError('Problem z weryfikacją reCAPTCHA. Spróbuj odświeżyć stronę.');
      } else {
        setError(error.message || 'Wystąpił błąd podczas logowania');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Dodaj skrypt reCAPTCHA przy montowaniu komponentu
  React.useEffect(() => {
    // Dodaj style do ukrycia badge'a
    const styleElement = document.createElement('style');
    styleElement.textContent = badgeStyle;
    document.head.appendChild(styleElement);

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Usuń style
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }

      // Usuń skrypt
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }

      // Usuń badge reCAPTCHA
      const badges = document.getElementsByClassName('grecaptcha-badge');
      while (badges.length > 0) {
        badges[0].remove();
      }

      // Wyczyść grecaptcha z window
      if ('grecaptcha' in window) {
        (window as any).grecaptcha = undefined;
        // lub alternatywnie:
        // window.grecaptcha = undefined;
      }
    };
  }, []);




  return (
    <div className="card w-full bg-opacity-100 shadow-xl" data-theme={theme}>
      <div className={`card-body ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="form-control">
            <label className="label">
              <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Adres email
              </span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className={`input input-bordered w-full ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Hasło
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`input input-bordered w-full pr-10 ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                  : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                  }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={20} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                ) : (
                  <Eye size={20} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/forgot-password"
              className={`text-sm font-medium ${theme === 'dark'
                ? 'text-green-400 hover:text-green-300'
                : 'text-green-600 hover:text-green-500'
                }`}
            >
              Zapomniałeś hasła?
            </Link>
          </div>

          {error && (
            <div className="alert alert-error bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={`btn w-full ${theme === 'dark'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
              } ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
          <div className="text-xs text-gray-500 text-center mt-4">
            <p>Formularz zabezpieczony za pomocą Google reCAPTCHA{' '}</p>
            <a href="https://policies.google.com/privacy" className="text-blue-500">Privacy Policy</a>{' '}, {' '}
            <a href="https://policies.google.com/terms" className="text-blue-500">Terms of Service</a>{' '}
          </div>

        </form>

        <div className="divider"></div>

        <div className="text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Nie masz konta?{' '}
            <Link
              href="/register"
              className={`font-medium ${theme === 'dark'
                ? 'text-green-400 hover:text-green-300'
                : 'text-green-600 hover:text-green-500'
                }`}
            >
              Zarejestruj się za darmo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;       