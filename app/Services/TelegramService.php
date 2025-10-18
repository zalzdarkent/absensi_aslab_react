<?php

namespace App\Services;

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

        // Log token status for debugging
        Log::info('TelegramService constructor', [
            'bot_token_set' => !empty($this->botToken),
            'bot_username' => $this->botUsername
        ]);

        // We're using direct cURL instead of longman library due to SSL issues
        // So no need to initialize the Telegram object
        $this->telegram = null;
    }

    /**
     * Send message to specific chat ID using direct cURL
     */
    public function sendMessage($chatId, $message, $parseMode = 'HTML')
    {
        try {
            // Log detailed info for debugging
            Log::info("Attempting to send Telegram message", [
                'chat_id' => $chatId,
                'message_length' => strlen($message),
                'parse_mode' => $parseMode,
                'bot_token_set' => !empty($this->botToken),
                'bot_username' => $this->botUsername
            ]);

            // Use direct cURL instead of longman library
            $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";

            $postData = [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => $parseMode
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_USERAGENT, 'AbsensiAslab Bot 1.0');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/x-www-form-urlencoded'
            ]);

            // SSL settings - disable verification in development
            if (env('APP_ENV') === 'local' || env('APP_DEBUG') === true) {
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            } else {
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
            }

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            // Log detailed response for debugging
            Log::info("Telegram API response", [
                'http_code' => $httpCode,
                'curl_error' => $error,
                'response' => $response
            ]);

            if ($error) {
                Log::error("CURL error sending Telegram message", [
                    'chat_id' => $chatId,
                    'curl_error' => $error
                ]);
                return false;
            }

            if ($httpCode !== 200) {
                Log::error("HTTP error sending Telegram message", [
                    'chat_id' => $chatId,
                    'http_code' => $httpCode,
                    'response' => $response
                ]);
                return false;
            }

            $data = json_decode($response, true);

            if ($data && $data['ok']) {
                Log::info("Telegram message sent successfully to chat_id: {$chatId}");
                return true;
            } else {
                Log::error("Failed to send Telegram message", [
                    'chat_id' => $chatId,
                    'api_error' => $data['description'] ?? 'Unknown error',
                    'response' => $response
                ]);
                return false;
            }

        } catch (\Exception $e) {
            Log::error('General error sending Telegram message', [
                'exception' => $e->getMessage(),
                'chat_id' => $chatId,
                'class' => get_class($e)
            ]);
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
        $message = "🎉 <b>Selamat! Telegram Berhasil Terhubung!</b>\n\n";
        $message .= "Halo <b>{$userName}</b>!\n\n";
        $message .= "✅ Akun Telegram Anda sudah berhasil terhubung dengan <b>Sistem Absensi Aslab</b>.\n\n";
        $message .= "🔔 <b>Notifikasi Otomatis Aktif:</b>\n";
        $message .= "• Reminder piket setiap pagi jam 07:00 (H-1)\n";
        $message .= "• Reminder piket setiap malam jam 19:00 (H-1)\n";
        $message .= "�️ Anda dapat mengatur notifikasi melalui dashboard sistem kapan saja.\n\n";
        $message .= "🤖 <i>Selamat bergabung dengan Sistem Absensi Aslab!</i>";

        Log::info("Welcome message sent to user", [
            'chat_id' => $chatId,
            'user_name' => $userName
        ]);

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
        // Check if user is already connected
        $user = User::where('telegram_chat_id', $chatId)->first();

        if ($user) {
            // User already connected - send status info
            $message = "👋 <b>Halo " . $user->name . "!</b>\n\n";
            $message .= "✅ Akun Telegram Anda sudah terhubung dengan sistem.\n\n";
            $message .= "🔔 Status notifikasi: " . ($user->telegram_notifications ? "Aktif ✅" : "Nonaktif ❌") . "\n";
            $message .= "📅 Hari piket: " . ucfirst($user->piket_day) . "\n\n";
            $message .= "ℹ️ <b>Command yang tersedia:</b>\n";
            $message .= "• /status - Cek status lengkap notifikasi\n";
            $message .= "• /chatid - Lihat Chat ID Anda\n\n";
            $message .= "🛠️ Kelola pengaturan melalui dashboard sistem.";
        } else {
            // New user - show connection instructions
            $message = "👋 <b>Selamat datang di Bot Absensi Aslab!</b>\n\n";
            $message .= "Halo <b>" . $firstName . "</b>!\n\n";
            $message .= "🤖 Bot ini mengirim reminder piket otomatis untuk asisten laboratorium.\n\n";
            $message .= "🔗 <b>Chat ID Anda:</b> <code>" . $chatId . "</code>\n\n";
            $message .= "📝 <b>Cara menghubungkan akun:</b>\n";
            $message .= "1. Login ke dashboard sistem absensi\n";
            $message .= "2. Buka menu pengaturan Telegram\n";
            $message .= "3. Masukkan Chat ID di atas\n";
            $message .= "4. Akun akan terhubung otomatis!\n\n";
            $message .= "ℹ️ <b>Command yang tersedia:</b>\n";
            $message .= "• /chatid - Dapatkan Chat ID Anda\n";
            $message .= "• /status - Cek status notifikasi";
        }

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
     * Test bot connection using direct cURL
     */
    public function testConnection()
    {
        try {
            Log::info('Testing Telegram bot connection', [
                'bot_token_length' => strlen($this->botToken),
                'bot_username' => $this->botUsername
            ]);

            $url = "https://api.telegram.org/bot{$this->botToken}/getMe";

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_USERAGENT, 'AbsensiAslab Bot 1.0');

            // SSL settings - disable verification in development
            if (env('APP_ENV') === 'local' || env('APP_DEBUG') === true) {
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            } else {
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
            }

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            Log::info('Telegram getMe response', [
                'http_code' => $httpCode,
                'curl_error' => $error,
                'response' => $response
            ]);

            if ($error) {
                Log::error('Telegram bot connection CURL error', [
                    'curl_error' => $error
                ]);
                return false;
            }

            if ($httpCode !== 200) {
                Log::error('Telegram bot connection HTTP error', [
                    'http_code' => $httpCode,
                    'response' => $response
                ]);
                return false;
            }

            $data = json_decode($response, true);

            if ($data && $data['ok']) {
                Log::info('Telegram bot connection successful', [
                    'bot_name' => $data['result']['first_name'],
                    'bot_username' => $data['result']['username'],
                    'bot_id' => $data['result']['id']
                ]);
                return true;
            } else {
                Log::error('Telegram bot connection failed', [
                    'api_error' => $data['description'] ?? 'Unknown error',
                    'response' => $response
                ]);
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Telegram bot test connection error', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Send attendance notification to user
     */
    public function sendAttendanceNotification($user, $type, $timestamp)
    {
        if (!$user->telegram_chat_id || !$user->telegram_notifications) {
            return false;
        }

        $time = \Carbon\Carbon::parse($timestamp)->setTimezone('Asia/Jakarta')->format('H:i');
        $date = \Carbon\Carbon::parse($timestamp)->setTimezone('Asia/Jakarta')->format('d/m/Y');

        if ($type === 'check_in') {
            $emoji = '🟢';
            $typeText = 'Check-In';
            $greeting = 'Selamat datang';
            $statusText = 'Anda telah berhasil check-in ke sistem.';
            $additionalInfo = "📍 Lokasi: Laboratorium Asisten\n⏰ Jangan lupa untuk check-out sebelum pulang.";
        } else {
            $emoji = '🔴';
            $typeText = 'Check-Out';
            $greeting = 'Sampai jumpa';
            $statusText = 'Anda telah berhasil check-out dari sistem.';
            $additionalInfo = "🏠 Terima kasih atas dedikasi Anda hari ini!\n💼 Semoga harimu menyenangkan.";
        }

        $message = "{$emoji} <b>{$typeText} Berhasil!</b>\n\n";
        $message .= "Halo <b>{$user->name}</b>!\n\n";
        $message .= "✅ {$statusText}\n\n";
        $message .= "📅 <b>Tanggal:</b> {$date}\n";
        $message .= "⏰ <b>Waktu:</b> {$time}\n\n";
        $message .= "{$additionalInfo}\n\n";
        $message .= "🤖 <i>Notifikasi otomatis dari Sistem Absensi Aslab</i>";

        Log::info("Attendance notification sent to user", [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'attendance_type' => $type,
            'timestamp' => $timestamp
        ]);

        return $this->sendMessage($user->telegram_chat_id, $message);
    }

    /**
     * Send test message (admin only for debugging)
     */
    public function sendTestMessage($chatId)
    {
        $message = "🧪 <b>Test Message</b>\n\n";
        $message .= "Ini adalah pesan test dari bot.\n";
        $message .= "Waktu: " . date('Y-m-d H:i:s') . "\n\n";
        $message .= "✅ Jika Anda menerima pesan ini, bot berfungsi dengan baik!";

        return $this->sendMessage($chatId, $message);
    }
}
