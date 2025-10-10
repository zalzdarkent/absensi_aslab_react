<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\NotificationController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

// Login as admin user (assuming user ID 1 is admin)
$admin = User::find(1);
Auth::login($admin);

echo "Testing NotificationController as user: {$admin->name} (role: {$admin->role})\n\n";

$controller = new NotificationController();
$response = $controller->index();
$data = json_decode($response->getContent(), true);

echo "Notifications count: " . count($data['notifications']) . "\n";
echo "Unread count: " . $data['unreadCount'] . "\n\n";

echo "Notifications:\n";
foreach ($data['notifications'] as $notification) {
    $status = $notification['isRead'] ? '[READ]' : '[UNREAD]';
    echo "- {$status} {$notification['title']}: {$notification['message']} ({$notification['time']})\n";
}