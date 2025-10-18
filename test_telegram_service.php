<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\TelegramService;

echo "Testing TelegramService...\n";

try {
    $telegramService = new TelegramService();
    echo "✅ TelegramService instantiated successfully\n";

    // Test connection
    echo "Testing bot connection...\n";
    $connected = $telegramService->testConnection();

    if ($connected) {
        echo "✅ Bot connection successful!\n";
    } else {
        echo "❌ Bot connection failed!\n";
    }

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "Test completed.\n";
