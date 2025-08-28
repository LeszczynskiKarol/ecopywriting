// src/components/auth/RegisterForm.tsx ecopywriting
'use client'

import React, { useState, useEffect } from 'react';
import { HEAP_EVENTS } from '../../constants/analytics';
import { analyticsEvents } from '../../utils/analytics';
import ModalDialog from '../../components/ui/ModalDialog';
import { Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { useHeap } from '../../context/HeapContext';
import { useConsent } from '../../context/ConsentContext';

const RegisterForm: React.FC = () => {
  const { clarityConsent } = useConsent();
  const router = useRouter();
  const { track, identify, addUserProperties } = useHeap();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuth();
  const [companyDetails, setCompanyDetails] = useState({
    companyName: '',
    nip: '',
    address: '',
    postalCode: '',
    city: '',
    buildingNumber: ''
  });
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const { theme } = useTheme();


  const checkExistingRegistration = async (email: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/check-registration-status/${email}`
      );
      const data = await response.json();

      if (data.success && data.needsVerification && !wasModalShownForEmail(email)) {
        setPendingEmail(email);
        setShowModal(true);
        markModalAsShownForEmail(email);
      }
    } catch (error) {
      console.error('Błąd podczas sprawdzania statusu rejestracji:', error);
    }
  };

  // Funkcja obsługująca decyzję użytkownika
  const handleModalConfirm = () => {
    handleSubmit(new Event('submit') as any);
    setShowModal(false);
  };



  // Dodaj useEffect dla sprawdzania statusu przy wpisywaniu emaila
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (email && validateEmail(email)) {
        checkExistingRegistration(email);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [email]);


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


  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string) => {
    return password.length >= 10;
  };


  useEffect(() => {
    if (email) {
      if (!validateEmail(email)) {
        setError('Nieprawidłowy format adresu email');
      } else {
        setError('');
      }
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      if (!validatePassword(password)) {
        setError('Hasło musi zawierać co najmniej 10 znaków');
      } else {
        setError('');
      }
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    track(HEAP_EVENTS.REGISTER.START);
    analyticsEvents.registerStart();
    setError('');

    if (!validateEmail(email)) {
      setError('Nieprawidłowy format adresu email');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Hasło musi zawierać co najmniej 10 znaków'); // Aktualizacja komunikatu błędu
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są zgodne');
      setIsLoading(false);
      return;
    }

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
            { action: 'register' }
          )
            .then(resolve)
            .catch(reject);
        });
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          companyDetails: showCompanyDetails ? companyDetails : null,
          recaptchaToken: recaptchaResponse
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        updateUser(data.user);

        // Analytics
        analyticsEvents.registerSuccess(data.user.id);
        if (data.user) { // Dodajemy sprawdzenie usera
          identify(data.user.id);
          addUserProperties({
            name: name,
            email: email,
            registrationDate: new Date().toISOString(),
            hasCompanyDetails: showCompanyDetails
          });
        }
        track(HEAP_EVENTS.REGISTER.SUCCESS);
        if (window.clarity && clarityConsent) {
          window.clarity.identify(data.user.id, {
            name: name,
            email: email,
            registrationDate: new Date().toISOString(),
            hasCompanyDetails: showCompanyDetails
          });
          window.clarity.set('userType', 'new_user');
          window.clarity.set('registrationType', showCompanyDetails ? 'business' : 'personal');
        }


        // Przekierowanie na końcu
        router.push('/verification');
      } else {
        track(HEAP_EVENTS.REGISTER.ERROR, {
          reason: data.message || 'Unknown error',
          email: email
        });
        analyticsEvents.registerError(data.message);
        setError(data.message || 'Wystąpił błąd podczas rejestracji');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      track('register_error', { error: errorMessage });
      analyticsEvents.registerError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const wasModalShownForEmail = (email: string): boolean => {
    const shownModals = localStorage.getItem('shownRegistrationModals');
    if (!shownModals) return false;
    return JSON.parse(shownModals).includes(email);
  };

  const markModalAsShownForEmail = (email: string) => {
    const shownModals = localStorage.getItem('shownRegistrationModals');
    const emailsArray = shownModals ? JSON.parse(shownModals) : [];

    if (!emailsArray.includes(email)) {
      emailsArray.push(email);
      localStorage.setItem('shownRegistrationModals', JSON.stringify(emailsArray));
    }
  };


  return (
    <div className="card w-full bg-opacity-100 shadow-xl" data-theme={theme}>
      <div className={`card-body ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Imię/nick
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`input input-bordered w-full ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                }`}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Email
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`input input-bordered w-full ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                }`}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`input input-bordered w-full pr-10 ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                  : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                  }`}
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

          <div className="form-control">
            <label className="label">
              <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Potwierdź hasło
              </span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`input input-bordered w-full ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                }`}
            />
          </div>

          <div className="form-control">
            <button
              type="button"
              onClick={() => setShowCompanyDetails(!showCompanyDetails)}
              className={`btn btn-ghost btn-sm gap-2 ${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'
                }`}
            >
              <Info size={16} />
              {showCompanyDetails ? 'Ukryj dane firmy' : 'Dane firmy do faktury (opcjonalnie)'}
            </button>
          </div>

          {showCompanyDetails && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Nazwa firmy
                  </span>
                </label>
                <input
                  type="text"
                  value={companyDetails.companyName}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, companyName: e.target.value })}
                  className={`input input-bordered w-full ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                    : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                    }`}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    NIP
                  </span>
                </label>
                <input
                  type="text"
                  value={companyDetails.nip}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, nip: e.target.value })}
                  className={`input input-bordered w-full ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                    : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                    }`}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Ulica
                  </span>
                </label>
                <input
                  type="text"
                  value={companyDetails.address}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
                  className={`input input-bordered w-full ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                    : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                    }`}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Numer budynku/lokalu
                  </span>
                </label>
                <input
                  type="text"
                  value={companyDetails.buildingNumber}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, buildingNumber: e.target.value })}
                  className={`input input-bordered w-full ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                    : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                    }`}
                  placeholder="np. 18/9"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Kod pocztowy
                  </span>
                </label>
                <input
                  type="text"
                  value={companyDetails.postalCode}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, postalCode: e.target.value })}
                  className={`input input-bordered w-full ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                    : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                    }`}
                  placeholder="00-000"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Miasto
                  </span>
                </label>
                <input
                  type="text"
                  value={companyDetails.city}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, city: e.target.value })}
                  className={`input input-bordered w-full ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
                    : 'bg-white border-gray-300 focus:border-green-300 focus:ring-green-200'
                    }`}
                />
              </div>
            </div>
          )}


          {error && (
            <div className="alert alert-error bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`btn w-full ${theme === 'dark'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              'Zarejestruj się'
            )}
          </button>
        </form>
        <div className="text-center mt-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Masz już konto?{' '}
            <Link
              href="/login"
              className={`font-medium ${theme === 'dark'
                ? 'text-green-400 hover:text-green-300'
                : 'text-green-600 hover:text-green-500'
                }`}
            >
              Zaloguj się
            </Link>
          </p>
        </div>

        <div className="divider"></div>

        <div className="text-xs text-gray-500 text-center mt-4">
          <p>Formularz zabezpieczony za pomocą Google reCAPTCHA{' '}</p>
          <a href="https://policies.google.com/privacy" className="text-blue-500">Privacy Policy</a>{' '}, {' '}
          <a href="https://policies.google.com/terms" className="text-blue-500">Terms of Service</a>{' '}
        </div>
      </div>
      <ModalDialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Wykryto niedokończoną rejestrację"
        message={`Dla adresu email ${pendingEmail} istnieje niedokończona rejestracja. Czy chcesz otrzymać nowy kod weryfikacyjny?`}
        type="info"
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default RegisterForm;    