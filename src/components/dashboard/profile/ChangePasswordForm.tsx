// src/components/dashboard/profile/ChangePasswordForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ModalDialog from '../../ui/ModalDialog';
import { Eye, EyeOff } from 'lucide-react';

type ModalContentType = {
  title: string;
  message: string;
  type: 'info' | 'error' | 'success';
};

const ChangePasswordForm: React.FC = () => {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContentType>({ title: '', message: '', type: 'info' });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      setModalContent({
        title: 'Błąd',
        message: 'Nowe hasła nie są identyczne',
        type: 'error'
      });
      setIsModalOpen(true);
      return;
    }
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setModalContent({
        title: 'Sukces',
        message: 'Hasło zostało zmienione pomyślnie',
        type: 'success'
      });
      setIsModalOpen(true);
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      setModalContent({
        title: 'Błąd',
        message: error instanceof Error ? error.message : 'Wystąpił nieznany błąd podczas zmiany hasła',
        type: 'error'
      });
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {key === 'currentPassword' ? 'Obecne hasło' :
                key === 'newPassword' ? 'Nowe hasło' : 'Potwierdź nowe hasło'}
            </label>
            <div className="relative">
              <input
                type={showPassword[key as keyof typeof showPassword] ? "text" : "password"}
                name={key}
                id={key}
                value={value}
                onChange={handleChange}
                className="mt-1 block w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/20 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(key as keyof typeof showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500"
              >
                {showPassword[key as keyof typeof showPassword] ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        ))}
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
          Zmień hasło
        </button>
      </form>
      <ModalDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </>
  );
};

export default ChangePasswordForm;