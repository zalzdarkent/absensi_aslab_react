<?php

require_once 'vendor/autoload.php';

// Load Laravel bootstrap
$app = require_once 'bootstrap/app.php';

// Boot the application
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "=== Test Attendance Event & Bot Setup ===\n";

try {
    // Load .env
    if (file_exists('.env')) {
        $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
                list($key, $value) = explode('=', $line, 2);
                $_ENV[trim($key)] = trim($value);
            }
        }
    }

    $botToken = $_ENV['TELEGRAM_BOT_TOKEN'] ?? null;
    $appUrl = $_ENV['APP_URL'] ?? 'http://localhost:8000';

    echo "Bot Token: " . ($botToken ? "✅ Set" : "❌ Missing") . "\n";
    echo "App URL: " . $appUrl . "\n";

    if ($botToken) {
        // 1. Test Bot Commands dengan webhook
        echo "\n1. Setting up webhook...\n";
        $webhookUrl = $appUrl . "/api/telegram/webhook/" . $botToken;
        echo "Webhook URL: " . $webhookUrl . "\n";

        $setWebhookUrl = "https://api.telegram.org/bot{$botToken}/setWebhook";

        $postData = [
            'url' => $webhookUrl,
            'allowed_updates' => json_encode(['message'])
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $setWebhookUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'AbsensiAslab Bot 1.0');

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        echo "Webhook setup response: " . $response . "\n";

        // 2. Test membuat attendance langsung via code
        echo "\n2. Testing attendance event...\n";

        // Cari user dengan telegram yang terhubung
        $user = \App\Models\User::whereNotNull('telegram_chat_id')
                              ->where('telegram_notifications', true)
                              ->first();

        if ($user) {
            echo "Found user with telegram: " . $user->name . " (Chat ID: " . $user->telegram_chat_id . ")\n";

            // Buat attendance baru
            $attendance = \App\Models\Attendance::create([
                'user_id' => $user->id,
                'type' => 'check_in',
                'timestamp' => now(),
                'date' => now()->toDateString(),
                'notes' => 'Test attendance via script'
            ]);

            echo "✅ Attendance created with ID: " . $attendance->id . "\n";
            echo "Event should be fired automatically...\n";
            echo "Check your telegram for notification!\n";

        } else {
            echo "❌ No user found with telegram connected and notifications enabled\n";
            echo "Please connect your telegram first in the dashboard\n";
        }

        // 3. Test webhook info
        echo "\n3. Checking webhook info...\n";
        $getWebhookUrl = "https://api.telegram.org/bot{$botToken}/getWebhookInfo";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $getWebhookUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'AbsensiAslab Bot 1.0');

        $response = curl_exec($ch);
        curl_close($ch);

        $webhookInfo = json_decode($response, true);
        if ($webhookInfo && $webhookInfo['ok']) {
            $info = $webhookInfo['result'];
            echo "Current webhook URL: " . ($info['url'] ?: 'Not set') . "\n";
            echo "Pending updates: " . ($info['pending_update_count'] ?? 0) . "\n";
            if (isset($info['last_error_message'])) {
                echo "Last error: " . $info['last_error_message'] . "\n";
            }
        }

    } else {
        echo "❌ Bot token not configured\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Instructions ===\n";
echo "1. Make sure your APP_URL in .env points to accessible server (not localhost if testing from external)\n";
echo "2. Try sending /status or /chatid to bot after webhook is set\n";
echo "3. Check Laravel logs: Get-Content storage/logs/laravel.log -Tail 20\n";

echo "\n";
