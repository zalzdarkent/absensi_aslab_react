<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\TelegramService;

echo "Checking Telegram Webhook Status...\n\n";

$botToken = env('TELEGRAM_BOT_TOKEN');

if (!$botToken) {
    echo "❌ TELEGRAM_BOT_TOKEN not found in .env file\n";
    exit(1);
}

echo "Bot Token: " . substr($botToken, 0, 10) . "...\n\n";

// Check current webhook info
echo "1. Checking current webhook info...\n";
$url = "https://api.telegram.org/bot{$botToken}/getWebhookInfo";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
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
        $webhook = $data['result'];
        echo "✅ Webhook Info Retrieved:\n";
        echo "   URL: " . ($webhook['url'] ?? 'Not set') . "\n";
        echo "   Has Custom Certificate: " . ($webhook['has_custom_certificate'] ? 'Yes' : 'No') . "\n";
        echo "   Pending Update Count: " . ($webhook['pending_update_count'] ?? 0) . "\n";
        echo "   Last Error Date: " . ($webhook['last_error_date'] ?? 'None') . "\n";
        echo "   Last Error Message: " . ($webhook['last_error_message'] ?? 'None') . "\n";
        echo "   Max Connections: " . ($webhook['max_connections'] ?? 'Default') . "\n";
        echo "   Allowed Updates: " . (empty($webhook['allowed_updates']) ? 'All' : implode(', ', $webhook['allowed_updates'])) . "\n\n";

        if (empty($webhook['url'])) {
            echo "❌ Webhook is NOT set!\n\n";

            // Suggest webhook URL
            $appUrl = env('APP_URL', 'http://localhost:8000');
            $webhookUrl = $appUrl . '/api/telegram/webhook/' . $botToken;

            echo "🔧 To set webhook, you need to call:\n";
            echo "   POST https://api.telegram.org/bot{$botToken}/setWebhook\n";
            echo "   Body: {\"url\": \"{$webhookUrl}\"}\n\n";

            echo "⚠️  NOTE: For local development (localhost), webhook won't work.\n";
            echo "   You need:\n";
            echo "   - ngrok tunnel: ngrok http 8000\n";
            echo "   - Or deploy to public server\n";
            echo "   - Or use polling instead of webhook\n\n";

            echo "Do you want to set webhook now? (y/n): ";
            $handle = fopen("php://stdin", "r");
            $input = trim(fgets($handle));
            fclose($handle);

            if (strtolower($input) === 'y') {
                echo "\nSetting webhook...\n";

                $setUrl = "https://api.telegram.org/bot{$botToken}/setWebhook";
                $postData = ['url' => $webhookUrl];

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $setUrl);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

                $setResponse = curl_exec($ch);
                $setHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($setHttpCode === 200) {
                    $setData = json_decode($setResponse, true);
                    if ($setData && $setData['ok']) {
                        echo "✅ Webhook set successfully!\n";
                        echo "   Description: " . ($setData['description'] ?? 'Success') . "\n";
                    } else {
                        echo "❌ Failed to set webhook\n";
                        echo "   Error: " . ($setData['description'] ?? 'Unknown error') . "\n";
                    }
                } else {
                    echo "❌ HTTP Error setting webhook: {$setHttpCode}\n";
                }
            }
        } else {
            echo "✅ Webhook is already set!\n";
        }
    } else {
        echo "❌ Failed to get webhook info: " . ($data['description'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ HTTP Error: {$httpCode}\n";
}

echo "\nDone.\n";
