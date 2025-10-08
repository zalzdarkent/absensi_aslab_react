<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->boot();

use App\Models\Attendance;
use App\Models\User;

$today = now()->toDateString();
echo "Today: " . $today . "\n\n";

echo "=== All Attendances Today ===\n";
$attendances = Attendance::where('date', $today)->with('user')->get();
foreach ($attendances as $attendance) {
    echo "ID: {$attendance->id}, User: {$attendance->user->name}, Type: {$attendance->type}, Time: {$attendance->timestamp}, Date: {$attendance->date}\n";
}

echo "\n=== Users with Role Aslab ===\n";
$users = User::where('role', 'aslab')->where('is_active', true)->get();
foreach ($users as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, RFID: {$user->rfid_code}\n";
}

echo "\n=== Dashboard Service Result ===\n";
use App\Services\DashboardService;
$service = new DashboardService();
$result = $service->getTodayAttendances();
echo json_encode($result, JSON_PRETTY_PRINT);