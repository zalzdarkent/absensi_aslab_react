<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Services\TelegramService;
use Carbon\Carbon;

class SendPiketReminders implements ShouldQueue
{
    use Queueable;

    public $timeout = 120; // 2 minutes timeout
    public $tries = 3; // Retry 3 times if failed

    private $reminderType;

    /**
     * Create a new job instance.
     */
    public function __construct($reminderType = 'morning')
    {
        $this->reminderType = $reminderType;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $telegramService = new TelegramService();

            // Test connection first
            if (!$telegramService->testConnection()) {
                Log::error('Telegram bot connection failed, aborting reminder job');
                return;
            }

            $tomorrow = Carbon::tomorrow();

            // Konversi hari ke bahasa Indonesia
            $dayMapping = [
                'Monday' => 'senin',
                'Tuesday' => 'selasa',
                'Wednesday' => 'rabu',
                'Thursday' => 'kamis',
                'Friday' => 'jumat',
                'Saturday' => 'sabtu',
                'Sunday' => 'minggu',
            ];

            $tomorrowDay = $dayMapping[$tomorrow->format('l')] ?? null;

            if (!$tomorrowDay) {
                Log::info('Tomorrow day not found in mapping: ' . $tomorrow->format('l'));
                return;
            }

            // Skip weekend
            if (in_array($tomorrowDay, ['sabtu', 'minggu'])) {
                Log::info('Tomorrow is weekend (' . $tomorrowDay . '), no piket reminders needed.');
                return;
            }

            // Ambil aslab yang piket besok dan punya telegram_chat_id
            $aslabs = User::where('role', 'aslab')
                ->where('is_active', true)
                ->where('piket_day', $tomorrowDay)
                ->whereNotNull('telegram_chat_id')
                ->where('telegram_notifications', true)
                ->get();

            if ($aslabs->isEmpty()) {
                Log::info("No aslabs found with piket day '{$tomorrowDay}' and telegram enabled");
                return;
            }

            $sent = 0;
            $failed = 0;

            foreach ($aslabs as $aslab) {
                try {
                    $result = $telegramService->sendPiketReminder($aslab, $this->reminderType);

                    if ($result) {
                        $sent++;
                        Log::info("✅ {$this->reminderType} reminder sent to {$aslab->name} (ID: {$aslab->id})");
                    } else {
                        $failed++;
                        Log::error("❌ Failed to send {$this->reminderType} reminder to {$aslab->name} (ID: {$aslab->id})");
                    }

                    // Small delay between messages to avoid rate limiting
                    usleep(100000); // 0.1 second

                } catch (\Exception $e) {
                    $failed++;
                    Log::error("Exception sending reminder to {$aslab->name}: " . $e->getMessage());
                }
            }

            // Log summary
            Log::info("📊 Piket reminder summary ({$this->reminderType}) for {$tomorrowDay}:", [
                'total_aslabs' => $aslabs->count(),
                'sent' => $sent,
                'failed' => $failed,
                'reminder_type' => $this->reminderType,
                'piket_day' => $tomorrowDay,
                'date' => $tomorrow->format('Y-m-d')
            ]);

        } catch (\Exception $e) {
            Log::error('SendPiketReminders job failed: ' . $e->getMessage(), [
                'reminder_type' => $this->reminderType,
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw the exception to mark job as failed
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendPiketReminders job failed permanently: ' . $exception->getMessage(), [
            'reminder_type' => $this->reminderType,
        ]);
    }
}
