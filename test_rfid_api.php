<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "Testing RFID API Call...\n";

// Find user dengan RFID code untuk testing
$user = User::where('role', 'aslab')
    ->where('is_active', true)
    ->whereNotNull('rfid_code')
    ->whereNotNull('telegram_chat_id')
    ->where('telegram_notifications', true)
    ->first();

if (!$user) {
    echo "❌ No user found with RFID code, telegram connected, and notifications enabled\n";
    
    // List users yang ada
    $users = User::where('role', 'aslab')->where('is_active', true)->get();
    echo "Available users:\n";
    foreach ($users as $u) {
        echo "- {$u->name}: RFID={$u->rfid_code}, Telegram={$u->telegram_chat_id}, Notif={$u->telegram_notifications}\n";
    }
    exit(1);
}

echo "Testing with user: {$user->name}\n";
echo "RFID Code: {$user->rfid_code}\n";
echo "Telegram Chat ID: {$user->telegram_chat_id}\n";
echo "Notifications Enabled: " . ($user->telegram_notifications ? 'Yes' : 'No') . "\n\n";

// Simulate RFID API call
$url = 'http://localhost:8000/api/rfid/scan';
$data = ['rfid_code' => $user->rfid_code];

echo "Making API call to: {$url}\n";
echo "Payload: " . json_encode($data) . "\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: {$httpCode}\n";
if ($error) {
    echo "CURL Error: {$error}\n";
}

echo "Response: " . $response . "\n\n";

if ($httpCode === 200) {
    $responseData = json_decode($response, true);
    if ($responseData && $responseData['success']) {
        echo "✅ RFID scan successful!\n";
        echo "Type: " . $responseData['data']['attendance']['type'] . "\n";
        echo "Time: " . $responseData['data']['attendance']['timestamp'] . "\n";
        echo "\n📱 Check your Telegram for notification!\n";
    } else {
        echo "❌ RFID scan failed: " . ($responseData['message'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ HTTP Error: {$httpCode}\n";
}

echo "\nTest completed.\n";