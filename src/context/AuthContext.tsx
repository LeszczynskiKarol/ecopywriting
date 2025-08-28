// src/context/AuthContext.tsx

'use client';
import jwt from 'jsonwebtoken';
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  accountBalance: number;
  isVerified: boolean;
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, recaptchaToken?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  getToken: () => string | null | undefined;
  refreshSession: () => Promise<boolean>;
  updateUser: (userData: User) => void;
  isUserVerified: () => boolean;
  refreshUserData: () => Promise<User | null>;
  unreadNotificationsCount: number;
  updateUnreadNotificationsCount: (count: number | ((prevCount: number) => number)) => void;
  checkAndRefreshSession: () => Promise<boolean>;
  fetchUnreadNotificationsCount: () => Promise<void>;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return token ? {
        id: '',
        name: '',
        email: '',
        role: '',
        isVerified: false,
        accountBalance: 0,
        notificationPermissions: {},
        newsletterPreferences: {},
        companyDetails: null
      } as User : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);



  const updateUnreadNotificationsCount = useCallback((count: number | ((prevCount: number) => number)) => {
    setUnreadNotificationsCount(prevCount => {
      if (typeof count === 'function') {
        return count(prevCount);
      }
      return count;
    });
  }, []);


  const isUserVerified = useCallback(() => {
    return user?.isVerified ?? false;
  }, [user]);



  const getToken = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || null;
    }
    return null;
  }, []);

  const fetchUnreadNotificationsCount = useCallback(async () => {
    const token = getToken();
    if (token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread-count`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadNotificationsCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    }
  }, [getToken]);

  const isTokenExpired = useCallback((token: string) => {
    try {
      const decoded: any = jwt.decode(token);
      if (!decoded) return true;
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Błąd podczas dekodowania tokenu:', error);
      return true;
    }
  }, []);

  const refreshUserData = useCallback(async (): Promise<User | null> => {  // zmiana typu zwracanego
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();

          if (userData.user && 'isVerified' in userData.user) {
            setUser(userData.user);

            if (userData.user.isVerified) {
              await fetchUnreadNotificationsCount();
            }
            return userData.user; // zwracamy dane użytkownika
          }
        }
        throw new Error('Failed to fetch user data');
      } catch (error) {
        console.error('Error refreshing user data:', error);
        localStorage.removeItem('token');
        setUser(null);
        return null;
      }
    }
    return null;
  }, [fetchUnreadNotificationsCount]);


  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {

        if (e.newValue) {
          refreshUserData();
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUserData]);

  useEffect(() => {
    const token = getToken();

    if (token && !isTokenExpired(token)) {

      refreshUserData();
    } else {

      setUser(null);
    }
  }, [getToken, isTokenExpired, refreshUserData]);






  const initAuth = useCallback(async () => {
    const token = getToken();

    if (token && !isTokenExpired(token)) {

      await refreshUserData();
    } else {

      setUser(null);
    }
    setLoading(false);
  }, [getToken, isTokenExpired]);



  const refreshSession = useCallback(async () => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      setUser(null);
      return false;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/refresh-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Sprawdź status weryfikacji
        if (!data.user.isVerified) {
          localStorage.removeItem('token');
          setUser(null);
          return false;
        }
        setUser(data.user);
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('sessionRefreshed'));
        return true;
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    }
    return false;
  }, [getToken, isTokenExpired]);



  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token && !isTokenExpired(token)) {
        try {
          await refreshUserData();
          await fetchUnreadNotificationsCount();
        } catch (error) {
          console.error('Error refreshing user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      await fetchUnreadNotificationsCount();
      setLoading(false);
    };

    initAuth();
  }, [fetchUnreadNotificationsCount]);


  useEffect(() => {
    initAuth();
  }, [initAuth]);




  const updateUser = (userData: User) => {
    setUser(userData);
  };

  useEffect(() => {
    if (user) {
      const refreshInterval = setInterval(() => {
        refreshSession();
      }, 15 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [user, refreshSession]);

  const forgotPassword = async (email: string): Promise<string> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset password email');
      }
      return data.message;
    } catch (error) {
      console.error('Error in forgot password:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };


  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = getToken();
      if (token && !isTokenExpired(token)) {
        await refreshUserData();
      } else if (user !== null) {
        setUser(null);
      }
      setLoading(false);
    };

    checkToken();
  }, [getToken, isTokenExpired, refreshUserData]);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrToken: string, password?: string, recaptchaToken?: string): Promise<boolean> => {
    try {
      console.log('=== ROZPOCZĘCIE PROCESU LOGOWANIA ===');
      if (password) {
        console.log('1. Wysyłanie żądania logowania...');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: emailOrToken,
            password,
            recaptchaToken
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Błąd logowania');
        }

        if (data.success && data.token) {
          // Sprawdzamy status weryfikacji
          if (!data.user.isVerified) {
            localStorage.setItem('token', data.token); // Zapisujemy token, żeby użytkownik mógł dokończyć weryfikację
            setUser(data.user);
            return true;
          }

          console.log('3. Zapisywanie tokenu...');
          localStorage.setItem('token', data.token);

          console.log('4. Ustawianie danych użytkownika...');
          if (data.user) {
            setUser(data.user);
            return true;
          }

          await refreshUserData();
          return true;
        }

        return false;
      }

      // Logowanie tokenem
      localStorage.setItem('token', emailOrToken);
      await refreshUserData();
      return true;
    } catch (error) {
      console.error('=== BŁĄD LOGOWANIA ===', error);
      throw error;
    }
  };


  const logout = async (): Promise<void> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        localStorage.removeItem('token');
        setUser(null);
      } else {
        throw new Error('Błąd podczas wylogowywania');
      }
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();

        setUser(updatedUser.user);
        return updatedUser.user;
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };


  const checkAndRefreshSession = useCallback(async () => {
    const token = getToken();
    if (token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/refresh-session`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          setUser(data.user);
          return true;
        }
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    }
    return false;
  }, [getToken]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateProfile,
      changePassword,
      forgotPassword,
      resetPassword,
      getToken,
      refreshUserData,
      isUserVerified,
      refreshSession,
      updateUser,
      unreadNotificationsCount,
      checkAndRefreshSession,
      updateUnreadNotificationsCount,
      fetchUnreadNotificationsCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

