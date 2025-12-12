<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Attendance;
use Carbon\Carbon;

echo "=== TESTING ATTENDANCE NOTIFICATION CONSISTENCY ===\n\n";

// Find a user with telegram connected
$user = User::where('role', 'aslab')
    ->where('is_active', true)
    ->whereNotNull('telegram_chat_id')
    ->where('telegram_notifications', true)
    ->first();

if (!$user) {
    echo "❌ No user with telegram connected found\n";
    exit(1);
}

echo "Testing with user: {$user->name}\n";
echo "Telegram Chat ID: {$user->telegram_chat_id}\n";
echo "Notifications enabled: " . ($user->telegram_notifications ? 'Yes' : 'No') . "\n\n";

// Test 1: Create check-in
echo "Test 1: Creating check-in attendance...\n";
$attendance1 = Attendance::create([
    'user_id' => $user->id,
    'type' => 'check_in',
    'timestamp' => Carbon::now(),
    'date' => Carbon::today(),
    'notes' => 'Test consistency - Check In'
]);
echo "✅ Check-in attendance created (ID: {$attendance1->id})\n";
sleep(2);

// Test 2: Create check-out
echo "\nTest 2: Creating check-out attendance...\n";
$attendance2 = Attendance::create([
    'user_id' => $user->id,
    'type' => 'check_out',
    'timestamp' => Carbon::now(),
    'date' => Carbon::today(),
    'notes' => 'Test consistency - Check Out'
]);
echo "✅ Check-out attendance created (ID: {$attendance2->id})\n";
sleep(2);

// Test 3: Try duplicate check-in (should be blocked by cache)
echo "\nTest 3: Creating duplicate check-in (should be blocked)...\n";
$attendance3 = Attendance::create([
    'user_id' => $user->id,
    'type' => 'check_in',
    'timestamp' => Carbon::now(),
    'date' => Carbon::today(),
    'notes' => 'Test consistency - Duplicate Check In'
]);
echo "✅ Duplicate check-in attendance created (ID: {$attendance3->id})\n";

echo "\n=== TEST COMPLETED ===\n";
echo "Check your Telegram for notifications.\n";
echo "You should receive:\n";
echo "1. ✅ Check-in notification\n";
echo "2. ✅ Check-out notification\n";
echo "3. ❌ NO duplicate check-in notification (blocked by cache)\n\n";

// Cleanup
echo "Cleaning up test records...\n";
$attendance1->delete();
$attendance2->delete();
$attendance3->delete();
echo "✅ Test records deleted\n";
