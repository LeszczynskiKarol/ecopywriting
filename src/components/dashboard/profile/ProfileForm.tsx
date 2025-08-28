// src/components/dashboard/profile/ProfileForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ModalDialog from '../../ui/ModalDialog';

interface UserData {
  name: string;
  email: string;
  companyDetails?: {
    companyName?: string;
    nip?: string;
    address?: string;
    buildingNumber?: string;
    postalCode?: string;
    city?: string;
  };
}

interface ProfileFormProps {
  user: UserData;
}

type ModalContentType = {
  title: string;
  message: string;
  type: 'info' | 'success' | 'error';
};

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const { updateProfile, refreshUserData } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContentType>({ title: '', message: '', type: 'info' });
  const [formData, setFormData] = useState({
    name: user.name,
    companyName: user.companyDetails?.companyName || '',
    nip: user.companyDetails?.nip || '',
    address: user.companyDetails?.address || '',
    buildingNumber: user.companyDetails?.buildingNumber || '',
    postalCode: user.companyDetails?.postalCode || '',
    city: user.companyDetails?.city || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      await updateProfile({
        name: formData.name,
        companyDetails: {
          companyName: formData.companyName,
          nip: formData.nip,
          address: formData.address,
          buildingNumber: formData.buildingNumber,
          postalCode: formData.postalCode,
          city: formData.city,
        }
      });
      console.log('Profile updated successfully');

      await refreshUserData();

      setModalContent({
        title: 'Profil zaktualizowany',
        message: 'Twoje dane zostały pomyślnie zaktualizowane.',
        type: 'success'
      });
    } catch (error) {
      console.error('Błąd podczas aktualizacji profilu:', error);
      setModalContent({
        title: 'Błąd aktualizacji',
        message: `Wystąpił błąd podczas aktualizacji profilu: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
        type: 'error'
      });
    } finally {
      setIsModalOpen(true);
    }
  };

  const fieldOrder = ['name', 'companyName', 'nip', 'address', 'buildingNumber', 'postalCode', 'city'] as const;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg">
        {fieldOrder.map((key) => (
          <div key={key} className="mb-4">
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {key === 'name' ? 'Imię/nick' :
                key === 'companyName' ? 'Nazwa firmy' :
                  key === 'nip' ? 'NIP' :
                    key === 'address' ? 'Ulica' :
                      key === 'buildingNumber' ? 'Numer budynku/lokalu' :
                        key === 'postalCode' ? 'Kod pocztowy' :
                          key === 'city' ? 'Miasto' :
                            key}
            </label>
            <input
              type="text"
              name={key}
              id={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={key === 'buildingNumber' ? 'np. 18/9' : ''}
              className="mt-1 block w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/20 outline-none"
              required={key === 'name'}
            />

          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Zaktualizuj profil
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

export default ProfileForm;