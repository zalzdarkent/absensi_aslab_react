<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\TelegramService;

$botToken = env('TELEGRAM_BOT_TOKEN');

if (!$botToken) {
    echo "❌ TELEGRAM_BOT_TOKEN not found in .env file\n";
    exit(1);
}

echo "Starting Telegram Bot Polling...\n";
echo "Bot Token: " . substr($botToken, 0, 10) . "...\n";
echo "Press Ctrl+C to stop\n\n";

$telegramService = new TelegramService();
$offset = 0;

while (true) {
    try {
        // Get updates from Telegram
        $url = "https://api.telegram.org/bot{$botToken}/getUpdates";
        $params = [
            'offset' => $offset + 1,
            'limit' => 100,
            'timeout' => 10
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $data = json_decode($response, true);

            if ($data && $data['ok'] && !empty($data['result'])) {
                foreach ($data['result'] as $update) {
                    $offset = max($offset, $update['update_id']);

                    echo "[" . date('Y-m-d H:i:s') . "] Processing update ID: " . $update['update_id'];

                    if (isset($update['message'])) {
                        $message = $update['message'];
                        $text = $message['text'] ?? '';
                        $chatId = $message['chat']['id'];
                        $firstName = $message['from']['first_name'] ?? 'User';

                        echo " - Message: {$text} from {$firstName} (Chat: {$chatId})\n";

                        // Process the update
                        $telegramService->handleWebhook($update);

                    } else {
                        echo " - Other update type\n";
                    }
                }
            } else {
                // No new updates, just wait
                echo ".";
                sleep(1);
            }
        } else {
            echo "❌ HTTP Error: {$httpCode}\n";
            sleep(5);
        }

    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
        sleep(5);
    }
}

echo "\nPolling stopped.\n";
