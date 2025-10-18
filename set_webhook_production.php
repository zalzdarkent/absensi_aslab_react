<?php
/*
 * Production Webhook Setup
 *
 * Jalankan script ini SEKALI SAJA setelah deploy ke server dengan SSL
 * Contoh: php set_webhook_production.php https://absensi.yourdomain.com
 */

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

if (count($argv) < 2) {
    echo "Usage: php set_webhook_production.php <domain_url>\n";
    echo "Example: php set_webhook_production.php https://absensi.yourdomain.com\n";
    exit(1);
}

$domainUrl = rtrim($argv[1], '/');
$botToken = env('TELEGRAM_BOT_TOKEN');

if (!$botToken) {
    echo "❌ TELEGRAM_BOT_TOKEN not found in .env file\n";
    exit(1);
}

echo "Setting Production Telegram Webhook...\n\n";
echo "Domain: {$domainUrl}\n";
echo "Bot Token: " . substr($botToken, 0, 10) . "...\n";

$webhookUrl = $domainUrl . '/api/telegram/webhook/' . $botToken;
echo "Webhook URL: {$webhookUrl}\n\n";

// Validate HTTPS
if (!str_starts_with($domainUrl, 'https://')) {
    echo "❌ Error: Production webhook requires HTTPS!\n";
    echo "   Make sure your domain has SSL certificate\n";
    exit(1);
}

// Set webhook
echo "Setting production webhook...\n";

$setUrl = "https://api.telegram.org/bot{$botToken}/setWebhook";
$postData = [
    'url' => $webhookUrl,
    'allowed_updates' => ['message', 'callback_query'],
    'drop_pending_updates' => true // Clear old updates
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $setUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && $data['ok']) {
        echo "✅ Production webhook set successfully!\n";
        echo "   Description: " . ($data['description'] ?? 'Success') . "\n\n";

        echo "🎉 Bot is now ready for production!\n";
        echo "📱 Test by sending /start to your bot in Telegram\n\n";

        echo "✅ Benefits of production webhook:\n";
        echo "   - Real-time message processing\n";
        echo "   - No polling script needed\n";
        echo "   - Better performance\n";
        echo "   - Automatic scaling\n\n";

        echo "💡 Commands available:\n";
        echo "   /start - Welcome message\n";
        echo "   /status - Status notifikasi\n";
        echo "   /chatid - Lihat Chat ID\n";
        echo "   /jadwal - Lihat jadwal piket\n";
        echo "   /piket - Lihat jadwal piket\n\n";

        echo "🔧 No more polling needed!\n";
        echo "   Just make sure your server is running and accessible via HTTPS\n";

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
