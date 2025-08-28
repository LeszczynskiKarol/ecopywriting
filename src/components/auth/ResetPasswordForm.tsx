// src/components/auth/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/navigation';

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { theme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Hasła nie są zgodne.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Hasło zostało pomyślnie zresetowane.');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.message || 'Wystąpił błąd podczas resetowania hasła.');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas resetowania hasła.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="newPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Nowe hasło
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring focus:ring-opacity-50 ${theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
            : 'border-gray-300 focus:border-green-300 focus:ring-green-200'
            }`}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Potwierdź nowe hasło
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring focus:ring-opacity-50 ${theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
            : 'border-gray-300 focus:border-green-300 focus:ring-green-200'
            }`}
        />
      </div>
      {error && <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}
      {success && <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`}>{success}</p>}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${theme === 'dark'
            ? 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500'
            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }`}
        >
          {isLoading ? 'Resetowanie...' : 'Zresetuj hasło'}
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;