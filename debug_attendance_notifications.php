<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Log;

echo "=== DEBUGGING ATTENDANCE NOTIFICATIONS ===\n\n";

// Check users with telegram setup
echo "1. Checking users with Telegram setup:\n";
$users = User::where('role', 'aslab')
    ->where('is_active', true)
    ->get();

foreach ($users as $user) {
    echo "   User: {$user->name}\n";
    echo "   - Chat ID: " . ($user->telegram_chat_id ?: 'Not set') . "\n";
    echo "   - Notifications: " . ($user->telegram_notifications ? 'Enabled' : 'Disabled') . "\n";
    echo "   - Ready for notifications: " . (($user->telegram_chat_id && $user->telegram_notifications) ? 'YES' : 'NO') . "\n\n";
}

// Check if there's any user ready for notifications
$readyUsers = User::where('role', 'aslab')
    ->where('is_active', true)
    ->whereNotNull('telegram_chat_id')
    ->where('telegram_notifications', true)
    ->count();

echo "2. Users ready for notifications: {$readyUsers}\n\n";

// Test event system
echo "3. Testing event listener registration:\n";
$attendanceCreatedListeners = app('events')->getListeners('App\Events\AttendanceCreated');

echo "   AttendanceCreated event listeners: " . count($attendanceCreatedListeners) . "\n";
foreach ($attendanceCreatedListeners as $listener) {
    echo "   - " . (is_string($listener) ? $listener : get_class($listener)) . "\n";
}

echo "\n4. Checking recent attendance records:\n";
$recentAttendances = \App\Models\Attendance::with('user')
    ->orderBy('created_at', 'desc')
    ->take(5)
    ->get();

foreach ($recentAttendances as $attendance) {
    echo "   ID: {$attendance->id} | User: {$attendance->user->name} | Type: {$attendance->type} | Created: {$attendance->created_at}\n";
}

echo "\n=== DEBUG COMPLETED ===\n";
