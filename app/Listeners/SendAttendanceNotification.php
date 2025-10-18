<?php

namespace App\Listeners;

use App\Events\AttendanceCreated;
use App\Services\TelegramService;
use Illuminate\Support\Facades\Log;

class SendAttendanceNotification
{
    // Sync processing for real-time notifications
    // Removed ShouldQueue to avoid model serialization issues

    private $telegramService;

    /**
     * Create the event listener.
     */
    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * Handle the event.
     */
    public function handle(AttendanceCreated $event): void
    {
        try {
            $attendance = $event->attendance;
            $user = $attendance->user;

            // Create unique cache key based on attendance ID to prevent duplicate processing
            // This ensures each attendance record only sends notification once
            $cacheKey = "attendance_notification_sent_{$attendance->id}";

            // Check if notification already sent for this specific attendance record
            if (cache()->has($cacheKey)) {
                Log::info("Attendance notification already sent for this attendance record, skipping", [
                    'attendance_id' => $attendance->id,
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'type' => $attendance->type,
                    'cache_key' => $cacheKey
                ]);
                return;
            }

            Log::info("Processing attendance notification", [
                'attendance_id' => $attendance->id,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'type' => $attendance->type,
                'date' => $attendance->date,
                'has_telegram' => !empty($user->telegram_chat_id),
                'notifications_enabled' => $user->telegram_notifications,
                'cache_key' => $cacheKey
            ]);

            // Send telegram notification if user has telegram connected
            if ($user->telegram_chat_id && $user->telegram_notifications) {
                $sent = $this->telegramService->sendAttendanceNotification(
                    $user,
                    $attendance->type,
                    $attendance->timestamp
                );

                // Cache that notification was sent for this specific attendance record
                if ($sent) {
                    cache()->put($cacheKey, true, now()->addHours(24));
                }

                Log::info("Attendance notification processed", [
                    'attendance_id' => $attendance->id,
                    'user_name' => $user->name,
                    'type' => $attendance->type,
                    'notification_sent' => $sent,
                    'cache_key' => $cacheKey
                ]);
            } else {
                Log::info("Attendance notification skipped", [
                    'attendance_id' => $attendance->id,
                    'user_name' => $user->name,
                    'reason' => !$user->telegram_chat_id ? 'No telegram connected' : 'Notifications disabled'
                ]);
            }        } catch (\Exception $e) {
            Log::error('Error sending attendance notification', [
                'exception' => $e->getMessage(),
                'attendance_id' => $event->attendance->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
