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
     * Log all sent and received messages
     */
    private function logMessageActivity($chatId, $messageContent, $direction = 'sent')
    {
        $logData = [
            'chat_id' => $chatId,
            'message_content' => $messageContent,
            'direction' => $direction,
            'timestamp' => now()->toDateTimeString()
        ];

        Log::info("Message activity logged", $logData);
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
        $message .= "• Notifikasi attendance (check-in/check-out)\n";
        $message .= "• Pengumuman penting dari admin\n\n";
        $message .= "ℹ️ <b>Command yang tersedia:</b>\n";
        $message .= "• /status - Cek status notifikasi Anda\n";
        $message .= "• /chatid - Lihat Chat ID Anda\n";
        $message .= "• /jadwal - Lihat jadwal piket Anda\n\n";
        $message .= "⚙️ Anda dapat mengatur notifikasi melalui dashboard sistem kapan saja.\n\n";
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

                    case '/jadwal':
                    case '/piket':
                        $this->handleJadwalCommand($chatId);
                        break;

                    // Admin commands
                    case '/report':
                        $this->handleReportCommand($chatId);
                        break;

                    case '/broadcast':
                        // For security, we might want to limit this command to specific admin users
                        // Assuming admin user ID is 123456789
                        if ($chatId == 123456789) {
                            // Extract message content after /broadcast command
                            $messageContent = trim(str_replace('/broadcast', '', $text));
                            $this->handleBroadcastCommand($chatId, $messageContent);
                        } else {
                            $this->sendMessage($chatId, "🚫 Anda tidak memiliki izin untuk menggunakan perintah ini.");
                        }
                        break;

                    case '/status_all':
                        // For security, we might want to limit this command to specific admin users
                        if ($chatId == 123456789) {
                            $this->handleStatusAllCommand($chatId);
                        } else {
                            $this->sendMessage($chatId, "🚫 Anda tidak memiliki izin untuk menggunakan perintah ini.");
                        }
                        break;

                    case '/help':
                        $this->handleHelpCommand($chatId);
                        break;

                    case '/feedback':
                        // Feedback command - expect user to send feedback text after the command
                        $this->sendMessage($chatId, "📝 Silakan kirimkan feedback Anda setelah perintah ini.");
                        break;

                    case '/schedule':
                        $this->handleScheduleCommand($chatId);
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
            $message .= "• /chatid - Lihat Chat ID Anda\n";
            $message .= "• /jadwal - Lihat jadwal piket Anda\n\n";
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
            $message .= "• /status - Cek status notifikasi\n";
            $message .= "• /jadwal - Lihat jadwal piket";
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
        $message .= "• /status - Cek status notifikasi\n";
        $message .= "• /jadwal - Lihat jadwal piket Anda\n";
        $message .= "• /piket - Lihat jadwal piket Anda\n\n";
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

    private function handleJadwalCommand($chatId)
    {
        $user = User::where('telegram_chat_id', $chatId)->first();

        if ($user) {
            // User terdaftar - tampilkan jadwal piketnya
            $dayNames = [
                'senin' => 'Senin',
                'selasa' => 'Selasa',
                'rabu' => 'Rabu',
                'kamis' => 'Kamis',
                'jumat' => 'Jumat'
            ];

            $dayIcons = [
                'senin' => '🌟',
                'selasa' => '⭐',
                'rabu' => '💫',
                'kamis' => '✨',
                'jumat' => '🌙'
            ];

            if ($user->piket_day) {
                $piketDay = $dayNames[$user->piket_day];
                $icon = $dayIcons[$user->piket_day];

                $message = "📅 <b>Jadwal Piket Anda</b>\n\n";
                $message .= "👤 <b>Nama:</b> {$user->name}\n";
                $message .= "📚 <b>Prodi:</b> {$user->prodi}\n";
                $message .= "🎓 <b>Semester:</b> {$user->semester}\n\n";
                $message .= "{$icon} <b>Hari Piket:</b> {$piketDay}\n\n";
                $message .= "⏰ <b>Waktu:</b> Sesuai jadwal yang ditentukan\n";
                $message .= "📍 <b>Lokasi:</b> Laboratorium Asisten\n\n";
                $message .= "📋 <b>Tugas Piket:</b>\n";
                $message .= "• Menjaga kebersihan laboratorium\n";
                $message .= "• Membantu mahasiswa yang membutuhkan\n";
                $message .= "• Melakukan absensi masuk dan keluar\n";
                $message .= "• Mengatur peralatan laboratorium\n\n";
                $message .= "🔔 <b>Reminder:</b> Anda akan mendapat notifikasi H-1 piket pada jam 07:00 dan 19:00\n\n";
                $message .= "💡 <i>Jangan lupa datang tepat waktu!</i>";
            } else {
                $message = "📅 <b>Jadwal Piket</b>\n\n";
                $message .= "👤 <b>Nama:</b> {$user->name}\n\n";
                $message .= "❌ <b>Anda belum memiliki jadwal piket</b>\n\n";
                $message .= "📞 Silakan hubungi admin untuk mengatur jadwal piket Anda melalui dashboard sistem.\n\n";
                $message .= "🌟 Jadwal yang tersedia:\n";
                foreach ($dayNames as $day => $name) {
                    $icon = $dayIcons[$day];
                    $message .= "• {$icon} {$name}\n";
                }
                $message .= "\n💼 <i>Setelah jadwal ditetapkan, Anda akan mendapat reminder otomatis!</i>";
            }
        } else {
            // User belum terdaftar
            $message = "❌ <b>Belum Terdaftar</b>\n\n";
            $message .= "Chat ID Anda belum terhubung dengan sistem absensi.\n\n";
            $message .= "🔗 Silakan hubungkan akun Telegram Anda melalui dashboard sistem absensi terlebih dahulu.\n\n";
            $message .= "🆔 <b>Chat ID Anda:</b> <code>{$chatId}</code>\n\n";
            $message .= "📝 <b>Cara menghubungkan:</b>\n";
            $message .= "1. Login ke dashboard sistem\n";
            $message .= "2. Buka pengaturan Telegram\n";
            $message .= "3. Masukkan Chat ID di atas\n";
            $message .= "4. Simpan pengaturan";
        }

        $this->sendMessage($chatId, $message);
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

    /**
     * Send daily attendance report to admin
     */
    public function sendDailyReportToAdmin($adminChatId, $reportData)
    {
        $message = "📊 <b>Laporan Harian Absensi</b>\n\n";
        $message .= "👥 <b>Total Aslab Hadir:</b> {$reportData['present']}\n";
        $message .= "❌ <b>Total Aslab Tidak Hadir:</b> {$reportData['absent']}\n\n";
        $message .= "📅 <b>Tanggal:</b> " . date('d/m/Y') . "\n\n";
        $message .= "💡 <i>Pesan otomatis dari Sistem Absensi Aslab</i>";

        return $this->sendMessage($adminChatId, $message);
    }

    /**
     * Notify admin about absent aslab
     */
    public function notifyAdminAboutAbsence($adminChatId, $absentAslabs)
    {
        $message = "🚨 <b>Notifikasi Ketidakhadiran Aslab</b>\n\n";
        $message .= "Berikut adalah daftar aslab yang tidak hadir hari ini:\n\n";

        foreach ($absentAslabs as $aslab) {
            $message .= "• {$aslab['name']} ({$aslab['prodi']}, Semester {$aslab['semester']})\n";
        }

        $message .= "\n💡 <i>Pesan otomatis dari Sistem Absensi Aslab</i>";

        return $this->sendMessage($adminChatId, $message);
    }

    /**
     * Handle /report command for admin
     */
    private function handleReportCommand($chatId)
    {
        // Generate a dummy report for now
        $reportData = [
            'present' => 10,
            'absent' => 2
        ];

        $this->sendDailyReportToAdmin($chatId, $reportData);
    }

    /**
     * Handle /broadcast command for admin
     */
    private function handleBroadcastCommand($chatId, $messageContent)
    {
        // Fetch all users with telegram_chat_id
        $users = User::whereNotNull('telegram_chat_id')->get();

        foreach ($users as $user) {
            $this->sendMessage($user->telegram_chat_id, $messageContent);
        }

        $this->sendMessage($chatId, "📢 Pesan broadcast berhasil dikirim ke semua aslab.");
    }

    /**
     * Handle /status_all command for admin
     */
    private function handleStatusAllCommand($chatId)
    {
        $users = User::all();
        $message = "📊 <b>Status Semua Aslab</b>\n\n";

        foreach ($users as $user) {
            $status = $user->telegram_notifications ? 'Aktif ✅' : 'Nonaktif ❌';
            $message .= "• {$user->name} ({$user->prodi}, Semester {$user->semester}): {$status}\n";
        }

        $this->sendMessage($chatId, $message);
    }

    /**
     * Handle /help command for aslab
     */
    private function handleHelpCommand($chatId)
    {
        $message = "ℹ️ <b>Daftar Command</b>\n\n";
        $message .= "• /start - Informasi bot dan Chat ID\n";
        $message .= "• /chatid - Dapatkan Chat ID Anda\n";
        $message .= "• /status - Cek status notifikasi\n";
        $message .= "• /jadwal - Lihat jadwal piket Anda\n";
        $message .= "• /feedback - Kirim feedback ke admin\n";
        $message .= "• /schedule - Lihat jadwal mingguan\n\n";
        $message .= "💡 <i>Gunakan command sesuai kebutuhan Anda!</i>";

        $this->sendMessage($chatId, $message);
    }

    /**
     * Handle /feedback command for aslab
     */
    private function handleFeedbackCommand($chatId, $feedback)
    {
        // Simpan feedback ke log untuk sementara
        Log::info("Feedback received from chat_id {$chatId}", [
            'feedback' => $feedback
        ]);

        $message = "✅ <b>Feedback Anda telah diterima!</b>\n\n";
        $message .= "Terima kasih atas masukan Anda. Admin akan meninjau feedback ini segera.";

        $this->sendMessage($chatId, $message);
    }

    /**
     * Handle /schedule command for aslab
     */
    private function handleScheduleCommand($chatId)
    {
        $user = User::where('telegram_chat_id', $chatId)->first();

        if ($user) {
            $message = "📅 <b>Jadwal Mingguan Anda</b>\n\n";
            $message .= "👤 <b>Nama:</b> {$user->name}\n";
            $message .= "📚 <b>Prodi:</b> {$user->prodi}\n";
            $message .= "🎓 <b>Semester:</b> {$user->semester}\n\n";
            $message .= "🔔 <b>Hari Piket:</b> {$user->piket_day}\n";
            $message .= "⏰ <b>Waktu:</b> Sesuai jadwal yang ditentukan\n";
            $message .= "📍 <b>Lokasi:</b> Laboratorium Asisten\n\n";
            $message .= "💡 <i>Jangan lupa untuk selalu hadir tepat waktu!</i>";
        } else {
            $message = "❌ <b>Belum Terdaftar</b>\n\n";
            $message .= "Chat ID Anda belum terhubung dengan sistem absensi.\n\n";
            $message .= "🔗 Silakan hubungkan akun Telegram Anda melalui dashboard sistem absensi.";
        }

        $this->sendMessage($chatId, $message);
    }

    /**
     * Send motivational message to aslab
     */
    public function sendMotivationalMessage($user)
    {
        $messages = [
            "🌟 Tetap semangat dan terus belajar! Kesuksesan dimulai dari langkah kecil.",
            "💡 Jangan lupa, setiap usaha yang kamu lakukan hari ini adalah investasi untuk masa depan.",
            "🚀 Jadilah versi terbaik dari dirimu hari ini! Semangat!",
            "🌈 Hari yang cerah untuk mencapai tujuanmu. Jangan menyerah!",
            "🔥 Ingat, kerja keras tidak akan mengkhianati hasil. Semangat terus!"
        ];

        $randomMessage = $messages[array_rand($messages)];

        $message = "📢 <b>Pesan Motivasi</b>\n\n";
        $message .= "Halo <b>{$user->name}</b>!\n\n";
        $message .= $randomMessage . "\n\n";
        $message .= "💡 <i>Pesan dari Sistem Absensi Aslab</i>";

        return $this->sendMessage($user->telegram_chat_id, $message);
    }

    /**
     * Broadcast a message to all aslab
     */
    public function broadcastMessageToAll($messageContent)
    {
        $users = User::whereNotNull('telegram_chat_id')->get();

        foreach ($users as $user) {
            $this->sendMessage($user->telegram_chat_id, $messageContent);
        }

        Log::info("Broadcast message sent to all aslab", [
            'message_content' => $messageContent,
            'total_recipients' => $users->count()
        ]);

        return true;
    }
}
