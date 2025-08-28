// src/components/auth/AuthRedirect.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  accountBalance: number;
  notificationPermissions: {
    browser?: boolean;
    sound?: boolean;
  };
  newsletterPreferences: {
    [key: string]: boolean;
  };
  companyDetails: {
    companyName?: string;
    nip?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    buildingNumber?: string;
  } | null;
}

const AuthRedirect: React.FC<{ children: React.ReactNode; currentPath: string }> = ({
  children,
  currentPath
}) => {
  const { user, loading, getToken, refreshUserData, fetchUnreadNotificationsCount } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let isSubscribed = true;

    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        router.push('/login');
        return;
      }

      if (!user && isSubscribed) {
        try {
          // Wywołujemy refreshUserData i przechowujemy wynik
          const result = await refreshUserData();

          // Sprawdzamy czy mamy wynik i czy jest on typu User
          if (result && 'isVerified' in result) {
            const userData = result as User;

            if (!userData.isVerified) {
              if (currentPath !== '/verification') {
                router.push('/verification');
                return;
              }
            } else {
              // Pobieramy powiadomienia tylko dla zweryfikowanych użytkowników
              await fetchUnreadNotificationsCount();
            }
          }
        } catch (error) {
          console.error('Błąd podczas sprawdzania autoryzacji:', error);
          router.push('/login');
        }
      } else if (user && 'isVerified' in user && !user.isVerified) {
        // Sprawdzanie dla już zalogowanego użytkownika
        if (currentPath !== '/verification') {
          router.push('/verification');
          return;
        }
      }
    };

    if (!loading) {
      checkAuth();
    }

    return () => {
      isSubscribed = false;
    };
  }, [user, loading, getToken, refreshUserData, router, currentPath, fetchUnreadNotificationsCount]);

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  const token = getToken();
  if (!token || !user) {
    return null;
  }

  // Bezpieczne sprawdzenie właściwości isVerified
  if ('isVerified' in user && !user.isVerified && currentPath !== '/verification') {
    router.push('/verification');
    return null;
  }

  return <>{children}</>;
};

export default AuthRedirect;  