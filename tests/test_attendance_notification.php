<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Attendance;
use App\Services\TelegramService;
use Carbon\Carbon;

echo "Testing Attendance Notification...\n";

// Find a user with telegram connected for testing
$user = User::where('role', 'aslab')
    ->where('is_active', true)
    ->whereNotNull('telegram_chat_id')
    ->where('telegram_notifications', true)
    ->first();

if (!$user) {
    echo "❌ No active aslab user with telegram connected found for testing\n";
    echo "Please make sure at least one user has telegram_chat_id and telegram_notifications enabled\n";
    exit(1);
}

echo "Testing with user: {$user->name} (Chat ID: {$user->telegram_chat_id})\n";

try {
    $telegramService = new TelegramService();

    echo "Sending test check-in notification...\n";
    $result = $telegramService->sendAttendanceNotification(
        $user,
        'check_in',
        Carbon::now()
    );

    if ($result) {
        echo "✅ Check-in notification sent successfully!\n";
    } else {
        echo "❌ Failed to send check-in notification\n";
    }

    echo "Waiting 3 seconds...\n";
    sleep(3);

    echo "Sending test check-out notification...\n";
    $result = $telegramService->sendAttendanceNotification(
        $user,
        'check_out',
        Carbon::now()
    );

    if ($result) {
        echo "✅ Check-out notification sent successfully!\n";
    } else {
        echo "❌ Failed to send check-out notification\n";
    }

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "Test completed. Check your Telegram to see if notifications arrived.\n";
