<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TelegramService;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TelegramController extends Controller
{
    private $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * Link telegram account with user
     */
    public function linkTelegram(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'chat_id' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $chatId = $request->chat_id;

            // Check if chat_id already used by another user
            $existingUser = User::where('telegram_chat_id', $chatId)
                ->where('id', '!=', $user->id)
                ->first();

            if ($existingUser) {
                return response()->json([
                    'message' => 'Chat ID sudah digunakan oleh user lain'
                ], 409);
            }

            // Update user telegram info
            $user->telegram_chat_id = $chatId;
            $user->telegram_notifications = true;
            $user->save();

            // Send welcome message
            $this->telegramService->sendWelcomeMessage($chatId, $user->name);

            Log::info("Telegram linked successfully", [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'chat_id' => $chatId
            ]);

            return response()->json([
                'message' => 'Telegram berhasil terhubung!',
                'data' => [
                    'telegram_chat_id' => $user->telegram_chat_id,
                    'telegram_notifications' => $user->telegram_notifications
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error linking telegram: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat menghubungkan Telegram'
            ], 500);
        }
    }

    /**
     * Unlink telegram account
     */
    public function unlinkTelegram(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user->telegram_chat_id) {
                return response()->json([
                    'message' => 'Telegram belum terhubung'
                ], 400);
            }

            // Send goodbye message
            $this->telegramService->sendMessage(
                $user->telegram_chat_id,
                "👋 <b>Telegram Disconnected</b>\n\nHalo <b>{$user->name}</b>!\n\nAkun Telegram Anda telah diputus dari sistem absensi aslab.\n\nAnda tidak akan menerima notifikasi reminder lagi.\n\n💡 <i>Terima kasih telah menggunakan layanan kami</i>"
            );

            // Clear telegram info
            $user->telegram_chat_id = null;
            $user->telegram_notifications = false;
            $user->save();

            Log::info("Telegram unlinked successfully", [
                'user_id' => $user->id,
                'user_name' => $user->name
            ]);

            return response()->json([
                'message' => 'Telegram berhasil diputus!'
            ]);

        } catch (\Exception $e) {
            Log::error('Error unlinking telegram: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat memutus koneksi Telegram'
            ], 500);
        }
    }

    /**
     * Toggle telegram notifications
     */
    public function toggleNotifications(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user->telegram_chat_id) {
                return response()->json([
                    'message' => 'Telegram belum terhubung'
                ], 400);
            }

            $user->telegram_notifications = !$user->telegram_notifications;
            $user->save();

            $status = $user->telegram_notifications ? 'diaktifkan' : 'dinonaktifkan';
            $emoji = $user->telegram_notifications ? '🔔' : '🔕';

            // Send notification status update
            $this->telegramService->sendMessage(
                $user->telegram_chat_id,
                "{$emoji} <b>Notifikasi {$status}</b>\n\nHalo <b>{$user->name}</b>!\n\nNotifikasi reminder piket Anda telah {$status}.\n\n💡 <i>Anda dapat mengubah pengaturan ini kapan saja melalui dashboard</i>"
            );

            return response()->json([
                'message' => "Notifikasi berhasil {$status}!",
                'telegram_notifications' => $user->telegram_notifications
            ]);

        } catch (\Exception $e) {
            Log::error('Error toggling notifications: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat mengubah pengaturan notifikasi'
            ], 500);
        }
    }

    /**
     * Send custom message to specific users
     */
    public function sendCustomMessage(Request $request)
    {
        // Only admin can send custom messages
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:4000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $users = User::whereIn('id', $request->user_ids)
                ->whereNotNull('telegram_chat_id')
                ->get();

            if ($users->isEmpty()) {
                return response()->json([
                    'message' => 'Tidak ada user dengan Telegram terhubung'
                ], 404);
            }

            $sent = 0;
            $failed = 0;

            foreach ($users as $user) {
                if ($this->telegramService->sendCustomMessage($user, $request->subject, $request->message)) {
                    $sent++;
                } else {
                    $failed++;
                }

                // Small delay to avoid rate limiting
                usleep(100000); // 0.1 second
            }

            Log::info("Custom message sent", [
                'admin_id' => Auth::id(),
                'subject' => $request->subject,
                'total_recipients' => $users->count(),
                'sent' => $sent,
                'failed' => $failed
            ]);

            return response()->json([
                'message' => "Pesan berhasil dikirim ke {$sent} user" . ($failed > 0 ? ", gagal {$failed} user" : ''),
                'data' => [
                    'sent' => $sent,
                    'failed' => $failed,
                    'total' => $users->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error sending custom message: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat mengirim pesan'
            ], 500);
        }
    }

    /**
     * Get telegram status for current user
     */
    public function getTelegramStatus()
    {
        $user = Auth::user();

        Log::info('Telegram status requested', [
            'user_id' => $user ? $user->id : null,
            'has_telegram_chat_id' => $user ? !empty($user->telegram_chat_id) : false
        ]);

        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        return response()->json([
            'telegram_connected' => !empty($user->telegram_chat_id),
            'telegram_notifications' => $user->telegram_notifications,
            'telegram_chat_id' => $user->telegram_chat_id ? '***' . substr($user->telegram_chat_id, -4) : null
        ]);
    }

    /**
     * Handle webhook from Telegram bot
     */
    public function handleWebhook(Request $request)
    {
        try {
            $update = $request->all();

            Log::info('Telegram webhook received', ['update' => $update]);

            $this->telegramService->handleWebhook($update);

            return response('OK', 200);

        } catch (\Exception $e) {
            Log::error('Telegram webhook error: ' . $e->getMessage());
            return response('Error', 500);
        }
    }

    /**
     * Test telegram connection (admin only)
     */
    public function testConnection()
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $result = $this->telegramService->testConnection();

            if ($result) {
                return response()->json([
                    'message' => 'Telegram bot connection successful',
                    'status' => 'connected'
                ]);
            } else {
                return response()->json([
                    'message' => 'Telegram bot connection failed',
                    'status' => 'failed'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error testing telegram connection: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error testing connection: ' . $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }
}
