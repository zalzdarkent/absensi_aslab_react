<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PeminjamanAset;

echo "Total PeminjamanAset: " . PeminjamanAset::count() . "\n";

// Test logika baru: 3 hari terakhir ATAU pending
$threeDaysAgo = now()->subDays(3);

$peminjamans = PeminjamanAset::with(['user', 'asetAslab'])
    ->where(function($query) use ($threeDaysAgo) {
        $query->where('created_at', '>=', $threeDaysAgo)  // 3 hari terakhir
              ->orWhere('status', 'pending');             // ATAU yang masih pending
    })
    ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")  // Pending di atas
    ->orderBy('created_at', 'desc')
    ->get();

echo "Total data (3 hari terakhir + pending): " . $peminjamans->count() . "\n";

foreach ($peminjamans as $peminjaman) {
    $itemName = $peminjaman->asetAslab->nama_aset ?? 'N/A';
    $age = $peminjaman->created_at->diffForHumans();
    echo "ID: {$peminjaman->id}, Status: {$peminjaman->status}, User: {$peminjaman->user->name}, Item: {$itemName}, Age: {$age}\n";
}

// Hitung pending saja untuk badge
$pendingCount = $peminjamans->where('status', 'pending')->count();
echo "\nPending count untuk badge: {$pendingCount}\n";