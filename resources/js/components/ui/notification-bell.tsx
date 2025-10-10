import { useState } from 'react';
import { Bell, Package, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';

interface NotificationBellProps {
    userRole: 'admin' | 'aslab' | 'mahasiswa' | 'dosen';
    className?: string;
}

export default function NotificationBell({ userRole, className = "" }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, handleNotificationClick } = useNotifications();

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'peminjaman_created':
                return <Package className="h-4 w-4 text-blue-500" />;
            case 'peminjaman_approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'peminjaman_rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: string, isRead: boolean) => {
        const baseColor = isRead ? 'opacity-60' : '';
        switch (type) {
            case 'peminjaman_created':
                return `border-l-blue-500 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 ${baseColor}`;
            case 'peminjaman_approved':
                return `border-l-green-500 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 ${baseColor}`;
            case 'peminjaman_rejected':
                return `border-l-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 ${baseColor}`;
            default:
                return `border-l-gray-500 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900 ${baseColor}`;
        }
    };

    const onNotificationClick = (notification: typeof notifications[0]) => {
        handleNotificationClick(notification);
        setIsOpen(false);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 relative hover-scale", className)}
                    aria-label="Notifikasi"
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center animate-pulse"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifikasi</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs h-6 px-2"
                        >
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Tidak ada notifikasi</p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "p-0 cursor-pointer transition-all duration-200",
                                    !notification.isRead ? "bg-blue-50/50 dark:bg-blue-950/50" : ""
                                )}
                                onClick={() => onNotificationClick(notification)}
                            >
                                <div className={cn(
                                    "flex items-start gap-3 p-3 w-full border-l-4 transition-colors duration-200",
                                    getNotificationColor(notification.type, notification.isRead),
                                    !notification.isRead ? "border-l-4" : "border-l-2"
                                )}>
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn(
                                                "text-sm font-medium",
                                                !notification.isRead ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
                                            )}>
                                                {notification.title}
                                            </p>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1 animate-pulse" />
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-500">
                                                {notification.time}
                                            </span>
                                            <ArrowRight className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-center justify-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    handleNotificationClick({
                                        id: 0,
                                        url: '/peminjaman-aset',
                                        isRead: true,
                                        type: '',
                                        title: '',
                                        message: '',
                                        time: '',
                                        data: {}
                                    });
                                    setIsOpen(false);
                                }}
                            >
                                Lihat Semua Peminjaman
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
