import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';
import {
    MessageCircle,
    Link,
    CheckCircle,
    XCircle,
    Bell,
    BellOff,
    ExternalLink,
    Copy,
    Loader2
} from 'lucide-react';

interface TelegramStatus {
    telegram_connected: boolean;
    telegram_notifications: boolean;
    telegram_chat_id: string | null;
}

export default function TelegramSetup() {
    const props = usePage().props as Record<string, unknown>;
    const auth = props.auth as { user?: Record<string, unknown> } | undefined;
    const csrf_token = String(props.csrf_token || '');
    const user = auth?.user;
    const [chatId, setChatId] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<TelegramStatus>({
        telegram_connected: Boolean(user?.telegram_chat_id),
        telegram_notifications: Boolean(user?.telegram_notifications),
        telegram_chat_id: (user?.telegram_chat_id as string) || null
    });
    const [showChatIdInput, setShowChatIdInput] = useState(false);

    const loadTelegramStatus = useCallback(async () => {
        try {
            const response = await fetch('/telegram/status', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf_token || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (error) {
            console.error('Error loading telegram status:', error);
        }
    }, [csrf_token]);

    // Load status saat component mount
    useEffect(() => {
        loadTelegramStatus();
    }, [loadTelegramStatus]);

    const handleLinkTelegram = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!chatId.trim()) {
            toast.error('Masukkan Chat ID Telegram');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/telegram/link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf_token || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ chat_id: chatId.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Telegram berhasil terhubung!');
                setChatId('');
                setShowChatIdInput(false);
                loadTelegramStatus();
            } else {
                toast.error(data.message || 'Gagal menghubungkan Telegram');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan');
            console.error('Error linking telegram:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlinkTelegram = async () => {
        if (!confirm('Yakin ingin memutus koneksi Telegram?')) return;

        setLoading(true);

        try {
            const response = await fetch('/telegram/unlink', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf_token || '',
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Telegram berhasil diputus!');
                loadTelegramStatus();
            } else {
                toast.error(data.message || 'Gagal memutus koneksi Telegram');
            }
        } catch {
            toast.error('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleNotifications = async () => {
        setLoading(true);

        try {
            const response = await fetch('/telegram/toggle-notifications', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf_token || '',
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                loadTelegramStatus();
            } else {
                toast.error(data.message || 'Gagal mengubah pengaturan notifikasi');
            }
        } catch {
            toast.error('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const openTelegramBot = () => {
        window.open('https://t.me/AbsenPiketLab_bot', '_blank');
    };

    const copyBotUsername = () => {
        navigator.clipboard.writeText('@AbsenPiketLab_bot');
        toast.success('Bot username berhasil disalin!');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Notifikasi Telegram
                    {status.telegram_connected && (
                        <Badge variant="secondary" className="ml-auto">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terhubung
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Hubungkan akun Telegram untuk menerima reminder piket otomatis setiap H-1 pada jam 07:00 dan 19:00
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {status.telegram_connected ? (
                    // Connected State
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-900 dark:text-green-100">
                                        Telegram Terhubung
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Chat ID: {status.telegram_chat_id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Notifikasi Reminder</Label>
                                <p className="text-xs text-muted-foreground">
                                    {status.telegram_notifications
                                        ? 'Anda akan menerima reminder piket otomatis'
                                        : 'Notifikasi reminder dinonaktifkan'
                                    }
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleNotifications}
                                disabled={loading}
                                className={status.telegram_notifications ? 'text-orange-600' : 'text-green-600'}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : status.telegram_notifications ? (
                                    <>
                                        <BellOff className="h-4 w-4 mr-1" />
                                        Nonaktifkan
                                    </>
                                ) : (
                                    <>
                                        <Bell className="h-4 w-4 mr-1" />
                                        Aktifkan
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="pt-2 border-t">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleUnlinkTelegram}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                Putus Koneksi Telegram
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Not Connected State
                    <div className="space-y-4">
                        <Alert>
                            <MessageCircle className="h-4 w-4" />
                            <AlertDescription className="space-y-2">
                                <div>
                                    <strong>Cara menghubungkan Telegram:</strong>
                                </div>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                    <li>Buka Telegram dan cari bot: <code className="px-1 py-0.5 bg-muted rounded">@AbsenPiketLab_bot</code></li>
                                    <li>Kirim pesan <code className="px-1 py-0.5 bg-muted rounded">/start</code> ke bot</li>
                                    <li>Bot akan memberikan Chat ID Anda</li>
                                    <li>Copy dan paste Chat ID tersebut di bawah ini</li>
                                </ol>
                            </AlertDescription>
                        </Alert>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={openTelegramBot}
                                className="flex-1"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Buka Bot Telegram
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={copyBotUsername}
                                title="Copy bot username"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        {!showChatIdInput ? (
                            <Button
                                onClick={() => setShowChatIdInput(true)}
                                className="w-full"
                                variant="default"
                            >
                                <Link className="h-4 w-4 mr-2" />
                                Hubungkan Telegram
                            </Button>
                        ) : (
                            <form onSubmit={handleLinkTelegram} className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="chat_id">Chat ID Telegram</Label>
                                    <Input
                                        id="chat_id"
                                        value={chatId}
                                        onChange={(e) => setChatId(e.target.value)}
                                        placeholder="Contoh: 123456789"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowChatIdInput(false);
                                            setChatId('');
                                        }}
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Menghubungkan...
                                            </>
                                        ) : (
                                            <>
                                                <Link className="h-4 w-4 mr-2" />
                                                Hubungkan
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Info tambahan */}
                <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                        💡 Satu bot melayani semua aslab. Setiap user memiliki Chat ID unik untuk menerima notifikasi pribadi.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
