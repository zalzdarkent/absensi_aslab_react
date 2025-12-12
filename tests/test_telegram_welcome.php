<?php

require_once 'vendor/autoload.php';

use App\Services\TelegramService;
use Illuminate\Support\Facades\Log;

// Mock untuk testing
if (!defined('LARAVEL_START')) {
    define('LARAVEL_START', microtime(true));
}

// Load environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Mock Laravel App
$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

// Test TelegramService
echo "=== Test Telegram Welcome Message ===\n";

try {
    $telegramService = new TelegramService();

    // Test welcome message
    echo "\n1. Testing sendWelcomeMessage()...\n";
    $testChatId = "123456789"; // Dummy chat ID for testing
    $testUserName = "Test User";

    $result = $telegramService->sendWelcomeMessage($testChatId, $testUserName);

    if ($result) {
        echo "✅ Welcome message sent successfully!\n";
    } else {
        echo "❌ Failed to send welcome message\n";
    }

    echo "\n2. Testing bot connection...\n";
    $connectionTest = $telegramService->testConnection();

    if ($connectionTest) {
        echo "✅ Bot connection successful!\n";
    } else {
        echo "❌ Bot connection failed\n";
    }

    echo "\n=== Summary ===\n";
    echo "Welcome message function: " . ($result ? "✅ Working" : "❌ Not working") . "\n";
    echo "Bot connection: " . ($connectionTest ? "✅ Working" : "❌ Not working") . "\n";

    if ($result && $connectionTest) {
        echo "\n🎉 Sistem telegram siap digunakan!\n";
        echo "Bot akan otomatis mengirim pesan selamat datang ketika aslab menghubungkan telegram mereka.\n";
    } else {
        echo "\n⚠️ Ada masalah dengan konfigurasi telegram. Periksa:\n";
        echo "- TELEGRAM_BOT_TOKEN di file .env\n";
        echo "- TELEGRAM_BOT_USERNAME di file .env\n";
        echo "- Koneksi internet\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "\nPeriksa konfigurasi telegram di file .env:\n";
    echo "- TELEGRAM_BOT_TOKEN=your_bot_token\n";
    echo "- TELEGRAM_BOT_USERNAME=your_bot_username\n";
}

echo "\n";
