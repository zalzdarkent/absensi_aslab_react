<?php

namespace App\Services;

use Longman\TelegramBot\Telegram;
use Longman\TelegramBot\Request;
use Longman\TelegramBot\Exception\TelegramException;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class TelegramService
{
    private $telegram;
    private $botToken;
    private $botUsername;

    public function __construct()
    {
        $this->botToken = env('TELEGRAM_BOT_TOKEN');
        $this->botUsername = env('TELEGRAM_BOT_USERNAME');

        try {
            $this->telegram = new Telegram($this->botToken, $this->botUsername);
        } catch (TelegramException $e) {
            Log::error('Telegram initialization error: ' . $e->getMessage());
        }
    }

    /**
     * Send message to specific chat ID
     */
    public function sendMessage($chatId, $message, $parseMode = 'HTML')
    {
        try {
            $result = Request::sendMessage([
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => $parseMode,
            ]);

            if ($result->isOk()) {
                Log::info("Telegram message sent successfully to chat_id: {$chatId}");
                return true;
            } else {
                Log::error("Failed to send Telegram message: " . $result->getDescription());
                return false;
            }
        } catch (TelegramException $e) {
            Log::error('Telegram send message error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send piket reminder to user
     */
    public function sendPiketReminder($user, $timeType = 'morning')
    {
        if (!$user->telegram_chat_id || !$user->telegram_notifications) {
            return false;
        }

        $dayNames = [
            'senin' => 'Senin',
            'selasa' => 'Selasa',
            'rabu' => 'Rabu',
            'kamis' => 'Kamis',
            'jumat' => 'Jumat',
        ];

        $dayName = $dayNames[$user->piket_day] ?? ucfirst($user->piket_day);
        $emoji = $timeType === 'morning' ? '🌅' : '🌙';
        $timeText = $timeType === 'morning' ? 'pagi' : 'malam';

        $message = "{$emoji} <b>Reminder Piket Aslab</b>\n\n";
        $message .= "Halo <b>{$user->name}</b>!\n\n";
        $message .= "📅 <b>Besok ({$dayName})</b> adalah jadwal piket Anda.\n";
        $message .= "⏰ Waktu: Sesuai jadwal yang ditentukan\n";
        $message .= "📍 Lokasi: Laboratorium Asisten\n\n";

        if ($timeType === 'morning') {
            $message .= "🔔 Jangan lupa untuk:\n";
            $message .= "• Datang tepat waktu\n";
            $message .= "• Membawa perlengkapan yang diperlukan\n";
            $message .= "• Melakukan absensi masuk dan keluar\n\n";
        } else {
            $message .= "🌙 Reminder malam ini:\n";
            $message .= "• Persiapkan diri untuk besok\n";
            $message .= "• Pastikan alarm sudah diset\n";
            $message .= "• Istirahat yang cukup\n\n";
        }

        $message .= "💡 <i>Pesan otomatis dari Sistem Absensi Aslab</i>";

        return $this->sendMessage($user->telegram_chat_id, $message);
    }

    /**
     * Send custom message to user
     */
    public function sendCustomMessage($user, $subject, $messageContent)
    {
        if (!$user->telegram_chat_id) {
            return false;
        }

        $message = "📢 <b>{$subject}</b>\n\n";
        $message .= "Halo <b>{$user->name}</b>!\n\n";
        $message .= $messageContent . "\n\n";
        $message .= "💡 <i>Pesan dari Admin Sistem Absensi Aslab</i>";

        return $this->sendMessage($user->telegram_chat_id, $message);
    }

    /**
     * Send welcome message when user connects telegram
     */
    public function sendWelcomeMessage($chatId, $userName)
    {
        $message = "👋 <b>Selamat datang di Bot Absensi Aslab!</b>\n\n";
        $message .= "Halo <b>{$userName}</b>!\n\n";
        $message .= "✅ Telegram Anda sudah berhasil terhubung dengan sistem absensi aslab.\n\n";
        $message .= "🔔 Anda akan menerima reminder piket otomatis:\n";
        $message .= "• Setiap pagi jam 07:00 (H-1 piket)\n";
        $message .= "• Setiap malam jam 19:00 (H-1 piket)\n\n";
        $message .= "🤖 Bot ini akan mengirim notifikasi penting terkait jadwal piket Anda.\n\n";
        $message .= "💡 <i>Terima kasih telah menggunakan Sistem Absensi Aslab</i>";

        return $this->sendMessage($chatId, $message);
    }

    /**
     * Handle incoming webhook from Telegram
     */
    public function handleWebhook($update)
    {
        try {
            if (isset($update['message'])) {
                $message = $update['message'];
                $chatId = $message['chat']['id'];
                $text = $message['text'] ?? '';
                $firstName = $message['from']['first_name'] ?? 'User';

                // Handle commands
                switch ($text) {
                    case '/start':
                        $this->handleStartCommand($chatId, $firstName);
                        break;

                    case '/chatid':
                        $this->handleChatIdCommand($chatId);
                        break;

                    case '/status':
                        $this->handleStatusCommand($chatId);
                        break;

                    default:
                        // Handle any text message
                        $this->handleDefaultMessage($chatId, $firstName);
                        break;
                }
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Telegram webhook handling error: ' . $e->getMessage());
            return false;
        }
    }

    private function handleStartCommand($chatId, $firstName)
    {
        $message = "👋 <b>Selamat datang di Bot Absensi Aslab!</b>\n\n";
        $message .= "Halo <b>{$firstName}</b>!\n\n";
        $message .= "🤖 Bot ini digunakan untuk mengirim reminder piket kepada asisten laboratorium.\n\n";
        $message .= "🔗 <b>Chat ID Anda:</b> <code>{$chatId}</code>\n\n";
        $message .= "📝 Gunakan Chat ID ini untuk menghubungkan akun Telegram Anda dengan sistem absensi.\n\n";
        $message .= "ℹ️ <b>Command yang tersedia:</b>\n";
        $message .= "• /chatid - Dapatkan Chat ID Anda\n";
        $message .= "• /status - Cek status notifikasi";

        $this->sendMessage($chatId, $message);
    }

    private function handleChatIdCommand($chatId)
    {
        $message = "🆔 <b>Chat ID Anda:</b>\n\n";
        $message .= "<code>{$chatId}</code>\n\n";
        $message .= "📋 Salin Chat ID ini dan masukkan ke dalam sistem absensi untuk mengaktifkan notifikasi Telegram.";

        $this->sendMessage($chatId, $message);
    }

    private function handleStatusCommand($chatId)
    {
        $user = User::where('telegram_chat_id', $chatId)->first();

        if ($user) {
            $piketDay = ucfirst($user->piket_day);
            $notifStatus = $user->telegram_notifications ? 'Aktif ✅' : 'Nonaktif ❌';

            $message = "📊 <b>Status Notifikasi</b>\n\n";
            $message .= "👤 <b>Nama:</b> {$user->name}\n";
            $message .= "📧 <b>Email:</b> {$user->email}\n";
            $message .= "📅 <b>Hari Piket:</b> {$piketDay}\n";
            $message .= "🔔 <b>Notifikasi:</b> {$notifStatus}\n\n";

            if ($user->telegram_notifications) {
                $message .= "⏰ Anda akan menerima reminder piket:\n";
                $message .= "• Setiap pagi jam 07:00 (H-1 piket)\n";
                $message .= "• Setiap malam jam 19:00 (H-1 piket)";
            } else {
                $message .= "🔕 Notifikasi saat ini dinonaktifkan.\nSilakan aktifkan melalui dashboard sistem.";
            }
        } else {
            $message = "❌ <b>Belum Terdaftar</b>\n\n";
            $message .= "Chat ID Anda belum terhubung dengan sistem absensi.\n\n";
            $message .= "🔗 Silakan hubungkan akun Telegram Anda melalui dashboard sistem absensi.\n\n";
            $message .= "🆔 <b>Chat ID Anda:</b> <code>{$chatId}</code>";
        }

        $this->sendMessage($chatId, $message);
    }

    private function handleDefaultMessage($chatId, $firstName)
    {
        $message = "👋 Halo <b>{$firstName}</b>!\n\n";
        $message .= "🤖 Saya adalah bot untuk reminder piket aslab.\n\n";
        $message .= "ℹ️ <b>Command yang tersedia:</b>\n";
        $message .= "• /start - Informasi bot dan Chat ID\n";
        $message .= "• /chatid - Dapatkan Chat ID Anda\n";
        $message .= "• /status - Cek status notifikasi\n\n";
        $message .= "🆔 <b>Chat ID Anda:</b> <code>{$chatId}</code>";

        $this->sendMessage($chatId, $message);
    }

    /**
     * Test bot connection
     */
    public function testConnection()
    {
        try {
            $result = Request::getMe();

            if ($result->isOk()) {
                $botInfo = $result->getResult();
                Log::info('Telegram bot connection successful', [
                    'bot_name' => $botInfo->getFirstName(),
                    'bot_username' => $botInfo->getUsername(),
                    'bot_id' => $botInfo->getId()
                ]);
                return true;
            } else {
                Log::error('Telegram bot connection failed: ' . $result->getDescription());
                return false;
            }
        } catch (TelegramException $e) {
            Log::error('Telegram bot test connection error: ' . $e->getMessage());
            return false;
        }
    }
}
