<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Attendance;
use Carbon\Carbon;

echo "Creating new attendance to test notification...\n";

// Find user with telegram
$user = User::where('telegram_chat_id', '!=', null)
    ->where('telegram_notifications', true)
    ->where('role', 'aslab')
    ->where('is_active', true)
    ->first();

if (!$user) {
    echo "❌ No user with telegram found!\n";
    exit(1);
}

echo "Testing with user: {$user->name}\n";
echo "Telegram Chat ID: {$user->telegram_chat_id}\n";
echo "Notifications enabled: " . ($user->telegram_notifications ? 'Yes' : 'No') . "\n";

$now = Carbon::now();
$today = $now->toDateString();

// Create new attendance record
echo "\nCreating check-out attendance record...\n";
$attendance = Attendance::create([
    'user_id' => $user->id,
    'type' => 'check_out',
    'timestamp' => $now,
    'date' => $today,
    'notes' => 'Test notification - Check out'
]);

echo "✅ Attendance created with ID: {$attendance->id}\n";
echo "This should trigger the AttendanceCreated event and send telegram notification.\n";
echo "Check your telegram and logs for notification delivery.\n";

// Wait 5 seconds then check if notification was sent
echo "\nWaiting 5 seconds for queue processing...\n";
sleep(5);

// Check cache to see if notification was marked as sent
$cacheKey = "attendance_notification_{$user->id}_check_out_{$today}";
$notificationSent = cache()->has($cacheKey);

echo "Cache key checked: {$cacheKey}\n";
echo "Notification marked as sent in cache: " . ($notificationSent ? 'Yes' : 'No') . "\n";

if (!$notificationSent) {
    echo "\n⚠️ Warning: Notification not marked as sent in cache. Check queue processing.\n";
    echo "Run: php artisan queue:work --once to process queue manually\n";
}

echo "\nTest completed.\n";
