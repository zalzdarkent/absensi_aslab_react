<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$botToken = env('TELEGRAM_BOT_TOKEN');

if (!$botToken) {
    echo "❌ TELEGRAM_BOT_TOKEN not found in .env file\n";
    exit(1);
}

echo "Checking webhook status...\n\n";

// Check current webhook
$url = "https://api.telegram.org/bot{$botToken}/getWebhookInfo";
$response = file_get_contents($url);
$data = json_decode($response, true);

if ($data['ok']) {
    echo "Current webhook info:\n";
    echo "URL: " . ($data['result']['url'] ?: 'None') . "\n";
    echo "Has custom certificate: " . ($data['result']['has_custom_certificate'] ? 'Yes' : 'No') . "\n";
    echo "Pending updates: " . $data['result']['pending_update_count'] . "\n";
    
    if (isset($data['result']['last_error_date'])) {
        echo "Last error: " . $data['result']['last_error_message'] . "\n";
    }
    
    echo "\n";
    
    // Delete webhook
    if ($data['result']['url']) {
        echo "Deleting webhook...\n";
        $deleteUrl = "https://api.telegram.org/bot{$botToken}/deleteWebhook?drop_pending_updates=true";
        $deleteResponse = file_get_contents($deleteUrl);
        $deleteData = json_decode($deleteResponse, true);
        
        if ($deleteData['ok']) {
            echo "✅ Webhook deleted successfully!\n";
            echo "You can now use polling mode.\n";
        } else {
            echo "❌ Failed to delete webhook: " . $deleteData['description'] . "\n";
        }
    } else {
        echo "ℹ️ No webhook set.\n";
        echo "Clearing any pending updates...\n";
        
        // Clear pending updates by calling getUpdates with offset=-1
        $clearUrl = "https://api.telegram.org/bot{$botToken}/getUpdates?offset=-1&timeout=1";
        $clearResponse = file_get_contents($clearUrl);
        $clearData = json_decode($clearResponse, true);
        
        if ($clearData['ok']) {
            echo "✅ Pending updates cleared!\n";
            echo "You can now use polling mode.\n";
        } else {
            echo "❌ Error clearing updates: " . $clearData['description'] . "\n";
        }
    }
} else {
    echo "❌ Error: " . $data['description'] . "\n";
}
