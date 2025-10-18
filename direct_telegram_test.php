<?php

echo "=== Telegram API Direct Test ===\n";

// Load .env file
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
$chatId = "1307406669"; // Your chat ID

if (!$botToken) {
    echo "❌ Bot token not found in .env\n";
    exit;
}

echo "Bot token length: " . strlen($botToken) . "\n";
echo "Testing direct API call...\n";

// Test 1: getMe API
$getMeUrl = "https://api.telegram.org/bot{$botToken}/getMe";
echo "\n1. Testing getMe API...\n";
echo "URL: " . $getMeUrl . "\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $getMeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Skip SSL verification for testing
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'AbsensiAslab Bot 1.0');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
if ($error) {
    echo "CURL Error: " . $error . "\n";
}
echo "Response: " . $response . "\n";

if ($httpCode == 200) {
    $data = json_decode($response, true);
    if ($data && $data['ok']) {
        echo "✅ getMe API working!\n";
        echo "Bot name: " . $data['result']['first_name'] . "\n";
        echo "Bot username: @" . $data['result']['username'] . "\n";
    } else {
        echo "❌ API response not ok: " . ($data['description'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ HTTP Error: " . $httpCode . "\n";
}

// Test 2: Send message API
echo "\n2. Testing sendMessage API...\n";
$sendUrl = "https://api.telegram.org/bot{$botToken}/sendMessage";
$message = "🧪 Test message dari direct API test pada " . date('Y-m-d H:i:s');

$postData = [
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'HTML'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $sendUrl);
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

echo "HTTP Code: " . $httpCode . "\n";
if ($error) {
    echo "CURL Error: " . $error . "\n";
}
echo "Response: " . $response . "\n";

if ($httpCode == 200) {
    $data = json_decode($response, true);
    if ($data && $data['ok']) {
        echo "✅ Message sent successfully!\n";
    } else {
        echo "❌ API response not ok: " . ($data['description'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ HTTP Error: " . $httpCode . "\n";
}

echo "\n=== PHP Configuration ===\n";
echo "cURL support: " . (extension_loaded('curl') ? "✅ Yes" : "❌ No") . "\n";
echo "OpenSSL support: " . (extension_loaded('openssl') ? "✅ Yes" : "❌ No") . "\n";
echo "User agent: " . ini_get('user_agent') . "\n";

echo "\n";
