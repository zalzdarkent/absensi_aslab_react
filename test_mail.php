<?php

use App\Notifications\ResetPasswordNotification;
use App\Models\User;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Laravel Beautiful Mail Test (Shadcn Style) ===\n";
echo "------------------------------\n";

$targetEmail = '2210631170004@student.unsika.ac.id';

// Mock user for notification
$user = new User();
$user->name = 'Aslab User';
$user->email = $targetEmail;

try {
    echo "Sending beautiful reset password email to: $targetEmail ...\n";
    
    // We send it directly via Notification to see the styling
    $user->notify(new ResetPasswordNotification('test-token-123'));

    echo "✅ SUCCESS: Email cantik berhasil dikirim!\n";
    echo "Silakan cek inbox (atau folder spam) di: $targetEmail\n";
    echo "Tampilannya sekarang sudah ala Shadcn (Zinc/Dark mode friendly).\n";

} catch (\Exception $e) {
    echo "❌ FAILED: Gagal mengirim email.\n";
    echo "Error Message: " . $e->getMessage() . "\n";
}

echo "==============================\n";
