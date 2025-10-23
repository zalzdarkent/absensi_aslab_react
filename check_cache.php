<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Carbon\Carbon;

echo "Checking current attendance notification cache...\n\n";

// Find user dengan telegram untuk cek cache
$user = User::where('role', 'aslab')
    ->where('is_active', true)
    ->whereNotNull('telegram_chat_id')
    ->where('telegram_notifications', true)
    ->first();

if (!$user) {
    echo "❌ No user found with telegram\n";
    exit(1);
}

$today = Carbon::today()->format('Y-m-d');

// Check cache untuk user ini
$cacheKeyCheckIn = "attendance_notification_{$user->id}_check_in_{$today}";
$cacheKeyCheckOut = "attendance_notification_{$user->id}_check_out_{$today}";

echo "User: {$user->name} (ID: {$user->id})\n";
echo "Date: {$today}\n\n";

echo "Cache Keys:\n";
echo "- Check-in: {$cacheKeyCheckIn}\n";
echo "- Check-out: {$cacheKeyCheckOut}\n\n";

echo "Cache Status:\n";
echo "- Check-in notification sent: " . (cache()->has($cacheKeyCheckIn) ? '✅ YES' : '❌ NO') . "\n";
echo "- Check-out notification sent: " . (cache()->has($cacheKeyCheckOut) ? '✅ YES' : '❌ NO') . "\n\n";

if (cache()->has($cacheKeyCheckIn) || cache()->has($cacheKeyCheckOut)) {
    echo "🔧 To clear cache and allow new notifications:\n";
    echo "1. Clear specific cache:\n";
    echo "   php artisan tinker\n";
    echo "   cache()->forget('{$cacheKeyCheckIn}');\n";
    echo "   cache()->forget('{$cacheKeyCheckOut}');\n\n";
    echo "2. Or clear all cache:\n";
    echo "   php artisan cache:clear\n\n";

    echo "Do you want me to clear the cache now? (y/n): ";
    $handle = fopen("php://stdin", "r");
    $input = trim(fgets($handle));
    fclose($handle);

    if (strtolower($input) === 'y') {
        cache()->forget($cacheKeyCheckIn);
        cache()->forget($cacheKeyCheckOut);
        echo "✅ Cache cleared! You can now receive new notifications.\n";
    } else {
        echo "Cache not cleared.\n";
    }
} else {
    echo "✅ No cache found. Notifications should work normally.\n";
}

echo "\nDone.\n";
