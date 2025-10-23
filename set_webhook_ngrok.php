<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

if (count($argv) < 2) {
    echo "Usage: php set_webhook_ngrok.php <ngrok_url>\n";
    echo "Example: php set_webhook_ngrok.php https://abc123.ngrok.io\n";
    exit(1);
}

$ngrokUrl = rtrim($argv[1], '/');
$botToken = env('TELEGRAM_BOT_TOKEN');

if (!$botToken) {
    echo "❌ TELEGRAM_BOT_TOKEN not found in .env file\n";
    exit(1);
}

echo "Setting Telegram Webhook with ngrok...\n\n";
echo "Bot Token: " . substr($botToken, 0, 10) . "...\n";
echo "ngrok URL: {$ngrokUrl}\n";

$webhookUrl = $ngrokUrl . '/api/telegram/webhook/' . $botToken;
echo "Webhook URL: {$webhookUrl}\n\n";

// Set webhook
echo "Setting webhook...\n";

$setUrl = "https://api.telegram.org/bot{$botToken}/setWebhook";
$postData = [
    'url' => $webhookUrl,
    'allowed_updates' => ['message', 'callback_query']
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $setUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && $data['ok']) {
        echo "✅ Webhook set successfully!\n";
        echo "   Description: " . ($data['description'] ?? 'Success') . "\n\n";

        echo "🎉 Bot is now ready to receive messages!\n";
        echo "📱 Test by sending /start to your bot in Telegram\n\n";

        echo "💡 Commands available:\n";
        echo "   /start - Welcome message\n";
        echo "   /status - Status notifikasi\n";
        echo "   /chatid - Lihat Chat ID\n";
        echo "   /jadwal - Lihat jadwal piket\n";
        echo "   /piket - Lihat jadwal piket\n\n";

        echo "⚠️  IMPORTANT:\n";
        echo "   - Keep ngrok running\n";
        echo "   - Keep Laravel server running (php artisan serve)\n";
        echo "   - If ngrok URL changes, run this script again\n";

    } else {
        echo "❌ Failed to set webhook\n";
        echo "   Error: " . ($data['description'] ?? 'Unknown error') . "\n";
        echo "   Response: " . $response . "\n";
    }
} else {
    echo "❌ HTTP Error setting webhook: {$httpCode}\n";
    echo "   Response: " . $response . "\n";
}

echo "\nDone.\n";
