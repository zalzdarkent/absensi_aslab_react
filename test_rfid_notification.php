<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "Testing RFID scan simulation...\n";

// Find user with RFID and telegram
$user = User::where('rfid_code', '!=', null)
    ->where('telegram_chat_id', '!=', null)
    ->where('telegram_notifications', true)
    ->where('role', 'aslab')
    ->where('is_active', true)
    ->first();

if (!$user) {
    echo "❌ No user with RFID and telegram found!\n";
    exit(1);
}

echo "Testing with user: {$user->name}\n";
echo "RFID Code: {$user->rfid_code}\n";
echo "Telegram Chat ID: {$user->telegram_chat_id}\n";

// Simulate RFID scan via API
$url = 'http://localhost:8000/api/rfid/scan';
$data = ['rfid_code' => $user->rfid_code];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);

echo "\nSending RFID scan request to API...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: {$httpCode}\n";
echo "Response: {$response}\n";

if ($httpCode == 200) {
    $data = json_decode($response, true);
    if ($data && $data['success']) {
        echo "✅ RFID scan successful!\n";
        echo "Action: " . $data['data']['attendance']['type'] . "\n";
        echo "Check your Telegram for notification!\n";
    } else {
        echo "❌ RFID scan failed: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ HTTP request failed!\n";
}

echo "\nTest completed.\n";
