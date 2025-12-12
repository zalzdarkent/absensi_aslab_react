<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Attendance;
use Carbon\Carbon;

echo "=== TESTING ATTENDANCE NOTIFICATION ===\n\n";

// Find user with telegram connected
$user = User::where('telegram_chat_id', '1307406669')->first(); // Alif's chat id from debug

if (!$user) {
    echo "❌ User not found\n";
    exit(1);
}

echo "Testing with user: {$user->name} (ID: {$user->id})\n";
echo "Telegram Chat ID: {$user->telegram_chat_id}\n";
echo "Notifications enabled: " . ($user->telegram_notifications ? 'Yes' : 'No') . "\n\n";

echo "Creating attendance record...\n";

$today = Carbon::today();
$now = Carbon::now();

try {
    $attendance = Attendance::create([
        'user_id' => $user->id,
        'type' => 'check_out',  // Using check_out since user already has check_in
        'timestamp' => $now,
        'date' => $today,
        'notes' => 'Test notification - ' . $now->format('H:i:s')
    ]);

    echo "✅ Attendance record created with ID: {$attendance->id}\n";
    echo "   Type: {$attendance->type}\n";
    echo "   Timestamp: {$attendance->timestamp}\n";

    echo "Waiting 3 seconds for event processing...\n";
    sleep(3);

    echo "Check your Telegram to see if notification was sent!\n\n";

    // Cleanup
    echo "Cleaning up test record...\n";
    $attendance->delete();
    echo "✅ Test record deleted\n";

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n=== TEST COMPLETED ===\n";
