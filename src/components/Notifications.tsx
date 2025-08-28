// src/components/Notifications.tsx 
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToggleRight, ToggleLeft, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';


interface OrderObject {
  _id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  declaredDeliveryDate: string;
  items: {
    topic: string;
    length: number;
    price: number;
    contentType: string;
    language: string;
    guidelines?: string;
  }[];
  hasUnreadNotifications?: boolean;
  attachments?: {
    [key: string]: {
      filename: string;
      url: string;
    } | {
      filename: string;
      url: string;
    }[];
  };
}

interface Notification {
  _id: string;
  type: 'status_change' | 'file_added' | 'thread_status_change' | 'new_message' | 'order_status_change' | 'new_admin_comment';
  message: string;
  isRead: boolean;
  createdAt: string;
  file?: {
    filename: string;
    url: string;
  };
  thread?: string;
  threadUrl?: string;
  subject?: string;
  isOpen?: boolean;
  orderId?: string;
  orderNumber?: string;
  newStatus?: string;
  order?: string | OrderObject;
}

const Notifications: React.FC = () => {
  const { user, getToken, unreadNotificationsCount, updateUnreadNotificationsCount } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?page=${pageNum}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (pageNum === 1) {
          setNotifications(data.data);
        } else {
          setNotifications(prev => [...prev, ...data.data]);
        }
        setHasMore(data.currentPage < data.totalPages);
        setPage(data.currentPage);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);




  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        updateUnreadNotificationsCount(data.count);
        console.log('Fetched unread count:', data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [getToken, updateUnreadNotificationsCount]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchNotifications(1);
        fetchUnreadCount();
      }
    }, 30000); // Sprawdzaj co 30 sekund
    return () => clearInterval(interval);
  }, [user, fetchNotifications, fetchUnreadCount]);


  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchNotifications(1);
      fetchUnreadCount();
    }
  }, [getToken]);




  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchNotifications(page + 1);
    }
  }, [hasMore, isLoading, page, fetchNotifications]);


  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (target.scrollHeight - target.scrollTop === target.clientHeight) {
        loadMore();
      }
    };

    const notificationList = notificationRef.current;
    if (notificationList) {
      notificationList.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (notificationList) {
        notificationList.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loadMore]);


  const showNewNotificationPopup = useCallback(() => {
    setShowPopup(true);
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    popupTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 10000);
  }, []);


  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleNotificationStatus = useCallback(async (id: string) => {
    try {
      if (id.startsWith('local_')) {
        // Dla lokalnych powiadomień, aktualizujemy tylko stan lokalny
        setNotifications(prev => prev.map(notif => {
          if (notif._id === id) {
            return { ...notif, isRead: !notif.isRead };
          }
          return notif;
        }));

        // Aktualizujemy licznik ręcznie
        updateUnreadNotificationsCount(count => {
          const notification = notifications.find(n => n._id === id);
          if (notification) {
            return notification.isRead ? count + 1 : count - 1;
          }
          return count;
        });
      } else {
        // Dla serwerowych powiadomień, wysyłamy żądanie do API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/toggle`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const updatedNotification = await response.json();
          setNotifications(prev =>
            prev.map(notif => {
              if (notif._id === id) {
                return { ...notif, isRead: updatedNotification.data.isRead };
              }
              return notif;
            })
          );
          // Aktualizujemy licznik na podstawie odpowiedzi z serwera
          updateUnreadNotificationsCount(updatedNotification.unreadCount);
        } else {
          throw new Error('Failed to update notification status');
        }
      }
    } catch (error) {
      console.error('Error toggling notification status:', error);
    }
  }, [getToken, updateUnreadNotificationsCount, notifications]);


  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        fetchUnreadCount(); // Zaktualizuj liczbę nieprzeczytanych powiadomień
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [getToken, fetchUnreadCount]);

  const renderNotificationMessage = (notification: Notification) => {
    console.log('Rendering notification:', notification);
    const formatDate = (dateString: string | Date) => {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date instanceof Date && !isNaN(date.getTime())
        ? date.toLocaleString()
        : 'Nieprawidłowa data';
    };

    switch (notification.type) {
      case 'thread_status_change':
        if (notification.message) {
          const match = notification.message.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            const [, linkText, linkUrl] = match;
            const parts = notification.message.split(/\[.*?\]\(.*?\)/);
            return (
              <p className="text-sm text-gray-800 dark:text-gray-200">
                Wątek{' '}
                <Link href={linkUrl} className="text-blue-500 hover:underline">
                  {linkText}
                </Link>{' '}
                {parts[1]}
              </p>
            );
          }
        }
        break;

      case 'new_message':
        if (notification.message) {
          const match = notification.message.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            const [, linkText, linkUrl] = match;
            const parts = notification.message.split(/\[.*?\]\(.*?\)/);
            return (
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {parts[0]}
                <Link href={linkUrl} className="text-blue-500 hover:underline">
                  {linkText}
                </Link>
                {parts[1]}
              </p>
            );
          }
        }
        break;



      case 'order_status_change':
        if (notification.orderNumber && notification.newStatus) {
          const orderUrl = `/dashboard/orders/${notification.orderId}`;
          const orderNumber = notification.orderNumber;
          const newStatus = notification.newStatus;

          return (
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Status zamówienia{' '}
              <Link href={orderUrl} className="text-blue-500 hover:underline">
                #{orderNumber}
              </Link>{' '}
              został zmieniony na: {newStatus}.
            </p>
          );
        }
        break;



      case 'file_added':
        if (notification.file && notification.orderNumber) {
          return (
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Dodano plik do zamówienia nr {notification.orderNumber}.
            </p>
          );
        }
        break;

      case 'new_admin_comment':
        console.log('Received new_admin_comment notification:', notification);
        let orderId = notification.orderId ||
          (typeof notification.order === 'string' ? notification.order :
            (notification.order && typeof notification.order === 'object' && '_id' in notification.order ? notification.order._id : undefined));
        let orderNumber = notification.orderNumber || 'Nieznany';

        console.log('Extracted orderId:', orderId);
        console.log('Extracted orderNumber:', orderNumber);

        if (orderId) {
          const orderUrl = `/dashboard/orders/${orderId}`;
          // Rozdzielamy wiadomość na części przed i po numerze zamówienia
          const [messagePart, numberPart] = notification.message.split('#');
          return (
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {messagePart}
              <Link href={orderUrl} className="text-blue-500 hover:underline">
                #{numberPart}
              </Link>
            </p>
          );
        } else {
          return (
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {notification.message}
            </p>
          );
        }


    }

    // Domyślna treść dla innych typów powiadomień
    return <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>;
  };


  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
            {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
          </span>
        )}
      </button>


      {showPopup && (
        <div className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-30">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            Nowe powiadomienie
          </p>
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {isOpen && (
        <div
          ref={notificationRef}
          className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          <div className="py-2">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Powiadomienia</h3>
              {notifications.some(n => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Oznacz wszystkie jako przeczytane
                </button>
              )}
            </div>


            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-2 text-gray-500 dark:text-gray-400">Brak nowych powiadomień</p>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${notification.isRead ? 'opacity-60' : ''
                      }`}
                  >
                    {renderNotificationMessage(notification)}
                    {notification.type === 'file_added' && notification.file && (
                      <a
                        href={notification.file.url}
                        download={notification.file.filename}
                        className="text-blue-500 dark:text-blue-400 hover:underline text-sm"
                      >
                        {notification.file.filename}
                      </a>

                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                    <button
                      onClick={() => toggleNotificationStatus(notification._id)}
                      className="text-xs text-primary hover:text-primary/80 mt-2 flex items-center gap-1.5 transition-colors"
                    >
                      {notification.isRead ?
                        <ToggleRight className="w-4 h-4" /> :
                        <ToggleLeft className="w-4 h-4" />
                      }
                      <span className="font-medium">
                        {notification.isRead ? 'Oznacz jako nieprzeczytane' : 'Oznacz jako przeczytane'}
                      </span>
                    </button>
                  </div>
                ))
              )}
              {hasMore && (
                <button
                  onClick={loadMore}
                  className="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-t border-gray-100 dark:border-gray-800"
                >
                  Załaduj więcej
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Notifications; 