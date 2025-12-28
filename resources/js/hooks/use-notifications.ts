import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface NotificationData {
    id: string | number;
    type: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    data: Record<string, unknown>;
    url: string;
}

interface NotificationResponse {
    notifications: NotificationData[];
    unreadCount: number;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/notifications', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            const data: NotificationResponse = await response.json();

            if (data && data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || 0);
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string | number) => {
        try {
            await fetch(`/notifications/${id}/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, isRead: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleNotificationClick = async (notification: NotificationData) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        // Try using window.location.href as fallback
        try {
            router.visit(notification.url);
        } catch (error) {
            console.error('Router visit failed, using window.location:', error);
            window.location.href = notification.url;
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
        refetch: fetchNotifications
    };
}
