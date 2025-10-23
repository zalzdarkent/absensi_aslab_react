<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\TelegramService;
use App\Models\User;

echo "Testing /jadwal command...\n\n";

// Find user with telegram connected
$user = User::where('role', 'aslab')
    ->where('is_active', true)
    ->whereNotNull('telegram_chat_id')
    ->where('telegram_notifications', true)
    ->first();

if (!$user) {
    echo "❌ No user found with telegram connected\n";
    exit(1);
}

echo "Testing with user: {$user->name}\n";
echo "Chat ID: {$user->telegram_chat_id}\n";
echo "Piket Day: " . ($user->piket_day ?? 'Not set') . "\n\n";

try {
    $telegramService = new TelegramService();

    // Simulate webhook call for /jadwal command
    $update = [
        'message' => [
            'chat' => ['id' => $user->telegram_chat_id],
            'from' => ['first_name' => $user->name],
            'text' => '/jadwal'
        ]
    ];

    echo "Simulating /jadwal command...\n";
    $result = $telegramService->handleWebhook($update);

    if ($result) {
        echo "✅ Command processed successfully!\n";
        echo "📱 Check your Telegram to see the schedule!\n";
    } else {
        echo "❌ Failed to process command\n";
    }

    echo "\nWaiting 3 seconds...\n";
    sleep(3);

    // Test /piket command too
    $update['message']['text'] = '/piket';

    echo "Simulating /piket command...\n";
    $result = $telegramService->handleWebhook($update);

    if ($result) {
        echo "✅ /piket command processed successfully!\n";
    } else {
        echo "❌ Failed to process /piket command\n";
    }

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\nTest completed. Check your Telegram for the schedule messages!\n";
