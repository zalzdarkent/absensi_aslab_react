<?php

// Simple telegram test
echo "=== Telegram Service Test ===\n";

// Load .env file manually
if (file_exists('.env')) {
    $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Check if .env variables exist
$botToken = $_ENV['TELEGRAM_BOT_TOKEN'] ?? null;
$botUsername = $_ENV['TELEGRAM_BOT_USERNAME'] ?? null;

echo "Bot Token: " . ($botToken ? "✅ Set" : "❌ Not set") . "\n";
echo "Bot Username: " . ($botUsername ? "✅ Set (@" . $botUsername . ")" : "❌ Not set") . "\n";

if ($botToken && $botUsername) {
    echo "\n✅ Telegram configuration looks good!\n";
    echo "\nAlur sistem telegram:\n";
    echo "1. Aslab buka bot telegram dan ketik /start\n";
    echo "2. Bot memberikan Chat ID\n";
    echo "3. Aslab input Chat ID di dashboard\n";
    echo "4. Sistem otomatis kirim welcome message\n";
    echo "5. Aslab mulai terima notifikasi reminder\n";
} else {
    echo "\n❌ Telegram not configured properly\n";
    echo "Please set in .env:\n";
    echo "TELEGRAM_BOT_TOKEN=your_token\n";
    echo "TELEGRAM_BOT_USERNAME=your_username\n";
}

echo "\n";
