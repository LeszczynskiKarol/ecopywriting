// src/components/dashboard/DashboardLayout.tsx
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Notifications from '../Notifications';
import { Menu, DollarSign, Home, FileText, User, LogOut, PlusCircle, Sun, Moon, MessageCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import TopUpModal from './TopUpModal';
import Loader from '../ui/Loader';
import TopUpSuccessModal from './TopUpSuccessModal';
import PaymentSuccessModal from './PaymentSuccessModal';
import { getCookie } from '../../utils/cookies';

interface PaymentDetails {
  orderId: string;
  orderNumber?: number;
  amount: number;
  paidAmount: number;
  discount: number;
  remainingBalance: number;
  paymentId: string;
  isTopUp: boolean;
  itemsCount?: number;
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchUnreadNotificationsCount } = useAuth();
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const { checkAndRefreshSession, refreshSession, logout, user, login, refreshUserData } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: number;
    totalPrice: number;
    discount: number;
    itemsCount: number;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    orderId: '',
    amount: 0,
    paidAmount: 0,
    discount: 0,
    remainingBalance: 0,
    paymentId: '',
    isTopUp: false
  });
  const isActivePath = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };
  const [showTopUpSuccess, setShowTopUpSuccess] = useState(false);
  const [topUpDetails, setTopUpDetails] = useState({
    amount: 0,
    paidAmount: 0,
    discount: 0,
    newBalance: 0,
    paymentId: '',
  });
  const handleOrderPaymentSuccess = async (sessionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/latest`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          amount: data.totalPrice,
          paidAmount: data.paidAmount,
          discount: data.appliedDiscount,
          remainingBalance: data.remainingBalance,
          paymentId: data.stripeSessionId,
          isTopUp: false,
          itemsCount: data.itemsCount
        });
        setShowPaymentSuccessModal(true);
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const navItems = [
    { name: 'Panel', icon: Home, href: '/dashboard' },
    { name: 'Zamówienia', icon: FileText, href: '/dashboard/orders' },

    { name: 'Płatności', icon: DollarSign, href: '/dashboard/payment-history' },
    { name: 'Dane do faktury', icon: User, href: '/dashboard/profile' },

  ];

  useEffect(() => {
    fetchUnreadNotificationsCount();
  }, [fetchUnreadNotificationsCount]);

  useEffect(() => {
    const checkAndRefreshSession = async () => {
      const sessionRefreshed = await refreshSession();
      if (sessionRefreshed) {
        // Odśwież dane użytkownika po pomyślnym odświeżeniu sesji
        await refreshUserData();
      }
    };

    // Sprawdzaj i odświeżaj sesję co 15 minut
    const intervalId = setInterval(checkAndRefreshSession, 15 * 60 * 1000);

    // Oczyść interwał przy odmontowaniu komponentu
    return () => clearInterval(intervalId);
  }, [refreshSession, refreshUserData]);


  const handleTopUpSuccess = async (sessionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/latest-top-up`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTopUpDetails({
          amount: data.amount,
          paidAmount: data.paidAmount,
          discount: data.appliedDiscount,
          newBalance: data.remainingBalance,
          paymentId: data.stripeSessionId,
        });
        setShowTopUpSuccess(true);
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error fetching top-up details:', error);
    }
  };

  useEffect(() => {
    const handleSessionAfterPayment = async () => {
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/session-token/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.token) {
              localStorage.setItem('token', data.token);
              await refreshUserData();
              if (pathname === '/dashboard/orders') {
                handleOrderPaymentSuccess(sessionId);
              } else if (pathname === '/dashboard') {
                handleTopUpSuccess(sessionId);
              }
            }
          }
          router.push(pathname);
        } catch (error) {
          console.error('Error handling session after payment:', error);
        }
      }
    };

    handleSessionAfterPayment();
  }, [searchParams, refreshUserData, router, pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const checkTempToken = async () => {
      const tempToken = getCookie('temp_auth_token');
      if (tempToken) {
        localStorage.setItem('token', tempToken);
        document.cookie = 'temp_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        await refreshUserData();
      }
    };

    checkTempToken();
  }, []);




  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleNavItemClick = () => {
    setIsSidebarOpen(false);
  };


  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/latest`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails({
          orderId: data.orderId,
          amount: data.totalPrice,
          paidAmount: data.paidAmount,
          discount: data.appliedDiscount,
          remainingBalance: data.remainingBalance,
          paymentId: data.stripeSessionId,
          isTopUp: false
        });
        setShowPaymentSuccessModal(true);
        await refreshUserData();
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const closeTopUpSuccessModal = () => {
    setShowTopUpSuccess(false);
    router.push(pathname);
  };

  useEffect(() => {
    const orderSuccess = searchParams.get('order_success');
    const paymentSuccess = searchParams.get('payment_success');

    if (paymentSuccess === 'true') {
      fetchOrderDetails();
    } else if (orderSuccess === 'true') {
      const lastOrderConfirmed = localStorage.getItem('lastOrderConfirmed');
      if (lastOrderConfirmed) {
        const orderDetails = JSON.parse(lastOrderConfirmed);
        setConfirmedOrder(orderDetails);
        setShowSuccessModal(true);
        localStorage.removeItem('lastOrderConfirmed');
      }
    }
    // Usuń parametry z URL
    if (orderSuccess || paymentSuccess) {
      router.replace('/dashboard/orders');
    }
  }, [searchParams, router]);


  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);

    } finally {
      setIsLoading(false);
      setIsLogoutDialogOpen(false);
    }
  };

  const closePaymentSuccessModal = () => {
    setShowPaymentSuccess(false);
    router.push(pathname);
  };

  return (
    <div className="relative flex h-screen">

      {/* Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md z-50">
        <div className="flex justify-between items-center px-4 py-1">
          <Link href='/dashboard'>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">eCopywriting</h2>
          </Link>
          <div className="flex items-center">
            <Notifications />
            <button
              onClick={toggleSidebar}
              className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                fixed lg:static
                inset-y-0 left-0
                w-64 bg-white dark:bg-gray-900 shadow-md
                flex flex-col
                transition-transform duration-300 ease-in-out
                z-40 lg:z-auto
            `}>
        {/* Logo tylko dla desktopa */}
        <div className="p-4 hidden lg:block">
          <Link href='/dashboard'><h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">eCopywriting</h2></Link>
        </div>

        <nav className="flex-grow mt-4">

          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 transition-colors duration-200 ${isActivePath(item.href)
                ? theme === 'dark'
                  ? 'bg-gray-800 text-green-400 border-r-4 border-green-400'
                  : 'bg-green-50 text-green-700 border-r-4 border-green-600'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              onClick={handleNavItemClick}
            >
              <item.icon
                className={`w-5 h-5 mr-2 ${isActivePath(item.href)
                  ? theme === 'dark'
                    ? 'text-green-400'
                    : 'text-green-600'
                  : ''
                  }`}
              />
              {item.name}
            </Link>
          ))}

          {/* Zmodyfikujmy też przycisk "Złóż zamówienie" */}
          <Link
            href="/dashboard/new-order"
            className={`flex items-center px-4 py-2 mt-2 transition-colors duration-200 ease-in-out rounded-md shadow-sm ${isActivePath('/dashboard/new-order')
              ? theme === 'dark'
                ? 'bg-green-700 text-green-100'
                : 'bg-green-200 text-green-900'
              : 'text-green-800 bg-green-100 dark:text-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700'
              }`}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Złóż zamówienie
          </Link>

          {/* Zmodyfikujmy przycisk "Doładuj konto" */}
          <button
            onClick={() => setIsTopUpModalOpen(true)}
            className={`flex items-center w-full px-4 py-2 mt-1 transition-colors duration-200 ${isTopUpModalOpen
              ? theme === 'dark'
                ? 'bg-gray-800 text-green-400'
                : 'bg-green-50 text-green-700'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Doładuj konto
          </button>


          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            className="flex items-center w-full px-4 py-2 mt-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Wyloguj
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2 mt-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
            {theme === 'dark' ? 'Tryb jasny' : 'Tryb ciemny'}
          </button>


        </nav>

        <div className="p-4 bg-gray-100 dark:bg-gray-800">

          <a href="https://www.ecopywriting.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 mb-2"
          >
            <svg
              className="w-4 h-4 mr-1.5 ml-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Strona główna</span>
          </a>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-full overflow-hidden text-ellipsis mb-2">
            {user?.email}
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Saldo: {user?.accountBalance && user.accountBalance > 0
              ? `${user.accountBalance.toFixed(2).replace('.', ',')} zł`
              : "0 zł"}
          </p>
        </div>
      </aside>

      {/* Main content */}

      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background-light dark:bg-background-dark pt-8 lg:pt-0">
        <div className="container mx-auto px-6 py-8">
          <div className="absolute top-4 right-10 z-10">
            <Notifications />
          </div>
          {children}
        </div>
      </main>







      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
      />
      <TopUpSuccessModal
        isOpen={showTopUpSuccess}
        onClose={closeTopUpSuccessModal}
        amount={topUpDetails.amount}
        paidAmount={topUpDetails.paidAmount}
        discount={topUpDetails.discount}
        newBalance={topUpDetails.newBalance}
        paymentId={topUpDetails.paymentId}
      />
      <PaymentSuccessModal
        isOpen={showPaymentSuccess}
        onClose={closePaymentSuccessModal}
        orderId={paymentDetails.orderId}
        orderNumber={paymentDetails.orderNumber}
        amount={paymentDetails.amount}
        paidAmount={paymentDetails.paidAmount}
        discount={paymentDetails.discount}
        remainingBalance={paymentDetails.remainingBalance}
        isTopUp={paymentDetails.isTopUp}
        paymentId={paymentDetails.paymentId}
        itemsCount={paymentDetails.itemsCount}
      />
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Czy na pewno chcesz się wylogować?</h2>
            <p className="mb-6">Ta akcja spowoduje wylogowanie z Twojego konta.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsLogoutDialogOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                disabled={isLoading}
              >
                Anuluj
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={isLoading}
              >
                {isLoading ? <Loader /> : 'Wyloguj'}
              </button>

            </div>

          </div>

        </div>
      )}

      {isLoading && <Loader />}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>

      )}
      {/* Ikona powiadomień dla desktopa */}




    </div>
  );
};




export default DashboardLayout;