// src/pages/forgot-password.tsx
'use client'
import React from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import Layout from '../../components/layout/Layout';
import { useTheme } from '../../context/ThemeContext';

const ForgotPasswordPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Layout title="Resetowanie hasła">
      <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className={`mt-6 text-center text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Zresetuj swoje hasło
            </h2>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;