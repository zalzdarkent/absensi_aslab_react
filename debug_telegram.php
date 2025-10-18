<?php

require_once 'vendor/autoload.php';

// Load Laravel bootstrap
$app = require_once 'bootstrap/app.php';

// Boot the application
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::capture();
$response = $kernel->handle($request);

// Test telegram service directly
echo "=== Direct Telegram Test ===\n";

try {
    // Create service instance
    $telegramService = new App\Services\TelegramService();

    // Test 1: Connection test
    echo "\n1. Testing bot connection...\n";
    $connectionResult = $telegramService->testConnection();
    echo "Connection result: " . ($connectionResult ? "✅ Success" : "❌ Failed") . "\n";

    // Test 2: Try sending a simple message with your chat ID
    echo "\n2. Testing basic message sending...\n";
    $testChatId = "1307406669"; // Your chat ID from the logs
    $testMessage = "🧪 Test message dari debug script pada " . date('Y-m-d H:i:s');
    $testResult = $telegramService->sendMessage($testChatId, $testMessage);
    echo "Test message result: " . ($testResult ? "✅ Success" : "❌ Failed") . "\n";

    // Test 3: Try sending welcome message
    echo "\n3. Testing welcome message...\n";
    $welcomeResult = $telegramService->sendWelcomeMessage($testChatId, "Test User");
    echo "Welcome message result: " . ($welcomeResult ? "✅ Success" : "❌ Failed") . "\n";

} catch (Exception $e) {
    echo "❌ Exception occurred: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\n=== Check Laravel Logs for Details ===\n";
echo "Run: Get-Content storage/logs/laravel.log -Tail 50\n";

echo "\n";
