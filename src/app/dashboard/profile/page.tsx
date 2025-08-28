// src/app/dashboard/profile/page.tsx
'use client';
import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import dynamic from 'next/dynamic';

const ProfileForm = dynamic(() => import('../../../components/dashboard/profile/ProfileForm'), {
  loading: () => <Loader />,
  ssr: false
});

const ChangePasswordForm = dynamic(() => import('../../../components/dashboard/profile/ChangePasswordForm'), {
  loading: () => <Loader />,
  ssr: false
});

const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profil użytkownika</h1>
      <Suspense fallback={<Loader />}>
        {user.companyDetails ? (
          <ProfileForm user={{ ...user, companyDetails: user.companyDetails }} />
        ) : (
          <ProfileForm user={{
            ...user, companyDetails: {
              companyName: '',
              nip: '',
              address: '',
              postalCode: '',
              city: '',
              buildingNumber: ''
            }
          }} />
        )}
      </Suspense>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Zmiana hasła</h2>
        <Suspense fallback={<Loader />}>
          <ChangePasswordForm />
        </Suspense>
      </div>
    </div>
  );
};

export default ProfilePage;