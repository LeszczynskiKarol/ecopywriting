// src/components/MobileNotifications.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
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



const MobileNotifications: React.FC = () => {
    const { user, getToken } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    function isOrderObject(order: any): order is OrderObject {
        return typeof order === 'object' && order !== null && '_id' in order && 'orderNumber' in order;
    }

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count);
                console.log('Fetched unread count:', data.count); // Dodaj to logowanie
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [getToken]);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user, fetchUnreadCount]);


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
                console.log('Fetched notifications:', data);
                if (pageNum === 1) {
                    setNotifications(data.data);
                } else {
                    setNotifications(prev => [...prev, ...data.data]);
                }
                setHasMore(data.currentPage < data.totalPages);
                setPage(data.currentPage);
                fetchUnreadCount();
            } else {
                console.error('Error fetching notifications:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        if (user) {
            fetchNotifications(1);
        }
    }, [user]);

    const loadMore = () => {
        if (hasMore && !isLoading) {
            fetchNotifications(page + 1);
        }
    };






    const toggleNotificationStatus = async (id: string) => {
        try {
            // Sprawdzamy, czy ID zaczyna się od "local_"
            if (id.startsWith('local_')) {
                // Jeśli tak, aktualizujemy tylko lokalny stan
                setNotifications(prev =>
                    prev.map(notif =>
                        notif._id === id ? { ...notif, isRead: !notif.isRead } : notif
                    )
                );
            } else {
                // Jeśli nie, wysyłamy żądanie do serwera
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
                        prev.map(notif =>
                            notif._id === id ? { ...notif, isRead: updatedNotification.data.isRead } : notif
                        )
                    );
                } else {
                    throw new Error('Failed to update notification status');
                }
            }
        } catch (error) {
            console.error('Error toggling notification status:', error);
        }
        await fetchUnreadCount();
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.ok) {
                setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
        await fetchUnreadCount();
    };

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
        <div className="relative md:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md relative"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Powiadomienia</h3>
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-500 hover:text-blue-700"
                        >
                            Oznacz wszystkie jako przeczytane
                        </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-center text-gray-500">Brak nowych powiadomień</p>
                        ) : (
                            notifications.map((notification) => (
                                <div key={notification._id} className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className={notification.isRead ? 'opacity-50' : ''}>
                                        {renderNotificationMessage(notification)}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                        <button
                                            onClick={() => toggleNotificationStatus(notification._id)}
                                            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                                        >
                                            {notification.isRead ? 'Oznacz jako nieprzeczytane' : 'Oznacz jako przeczytane'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {hasMore && (
                        <button
                            onClick={loadMore}
                            disabled={isLoading}
                            className="w-full p-2 text-center text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {isLoading ? 'Ładowanie...' : 'Załaduj więcej'}
                            <ChevronDown className="inline-block ml-2 h-4 w-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MobileNotifications;
