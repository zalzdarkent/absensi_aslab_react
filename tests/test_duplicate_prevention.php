<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Attendance;
use Carbon\Carbon;

// Find a user for testing
$user = User::where('role', 'aslab')->where('is_active', true)->first();

if (!$user) {
    echo "No active aslab user found for testing\n";
    exit(1);
}

echo "Testing duplicate prevention for user: {$user->name} (ID: {$user->id})\n";

$today = Carbon::today();
$now = Carbon::now();

echo "Creating first check-in attendance record...\n";
$attendance1 = Attendance::create([
    'user_id' => $user->id,
    'type' => 'check_in',
    'timestamp' => $now,
    'date' => $today,
    'notes' => 'Test duplicate prevention - Record 1'
]);

echo "First attendance created with ID: {$attendance1->id}\n";

// Wait 2 seconds then create another one
echo "Waiting 2 seconds...\n";
sleep(2);

echo "Creating second check-in attendance record (should not send duplicate telegram)...\n";
$attendance2 = Attendance::create([
    'user_id' => $user->id,
    'type' => 'check_in',
    'timestamp' => $now->copy()->addSeconds(2),
    'date' => $today,
    'notes' => 'Test duplicate prevention - Record 2'
]);

echo "Second attendance created with ID: {$attendance2->id}\n";

// Check cache
$cacheKey = "attendance_notification_{$user->id}_check_in_{$today->format('Y-m-d')}";
$cacheExists = cache()->has($cacheKey);

echo "Cache key: {$cacheKey}\n";
echo "Cache exists: " . ($cacheExists ? 'Yes' : 'No') . "\n";

echo "Test completed. Check telegram messages to confirm only one notification was sent.\n";

// Cleanup - delete test records
echo "Cleaning up test records...\n";
$attendance1->delete();
$attendance2->delete();
echo "Test records deleted.\n";
