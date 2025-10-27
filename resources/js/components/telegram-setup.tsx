import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    Loader2,
    HelpCircle
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
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Notifikasi Telegram
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm p-4">
                                <div className="space-y-2">
                                    <p className="font-semibold text-sm">Langkah-langkah menghubungkan:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-xs">
                                        <li>Klik "Buka Bot Telegram" di bawah</li>
                                        <li>Di Telegram, klik "START" atau "MULAI"</li>
                                        <li>Salin atau copy Chat ID yang diberikan oleh bot</li>
                                        <li>Kembali ke sini, klik "Hubungkan Telegram"</li>
                                        <li>Tempel Chat ID dan klik "Hubungkan"</li>
                                    </ol>
                                </div>
                            </TooltipContent>
                        </Tooltip>
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
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={openTelegramBot}
                                className="flex-1 h-9"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Buka Bot Telegram
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={copyBotUsername}
                                title="Copy bot username @AbsenPiketLab_bot"
                                className="h-9 w-9"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        {!showChatIdInput ? (
                            <Button
                                onClick={() => setShowChatIdInput(true)}
                                className="w-full h-9"
                                variant="default"
                            >
                                <Link className="h-4 w-4 mr-2" />
                                Hubungkan Telegram
                            </Button>
                        ) : (
                            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                                <div className="space-y-2">
                                    <Label htmlFor="chat_id" className="text-sm font-medium">
                                        Chat ID Telegram
                                    </Label>
                                    <Input
                                        id="chat_id"
                                        value={chatId}
                                        onChange={(e) => setChatId(e.target.value)}
                                        placeholder="Contoh: 123456789"
                                        required
                                        disabled={loading}
                                        className="h-9"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        💡 Dapatkan Chat ID dengan mengirim /chatid ke bot
                                    </p>
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
                                        className="flex-1 h-9"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        onClick={handleLinkTelegram}
                                        disabled={loading || !chatId.trim()}
                                        className="flex-1 h-9"
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
                            </div>
                        )}
                    </div>
                )}

                {/* Info tambahan */}
                                {/* Info tambahan */}
                <div className="pt-3 border-t mt-4">
                    <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <MessageCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                            <p className="font-medium mb-1">Bot Telegram AbsenPiketLab</p>
                            <p>Satu bot melayani semua aslab. Setiap user memiliki Chat ID unik untuk menerima notifikasi pribadi berupa reminder piket dan notifikasi attendance.</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        </TooltipProvider>
    );
}
