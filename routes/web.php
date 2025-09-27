<?php

use App\Http\Controllers\AslabController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JadwalPiketController;
use App\Http\Controllers\AsetAslabController;
use App\Http\Controllers\JenisAsetAslabController;
use App\Http\Controllers\PeminjamanBarangController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard - accessible to all logged-in users
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin only routes
    Route::middleware(['role:admin'])->group(function () {
        // Aslab management routes - only admin can manage aslabs
        Route::resource('aslabs', AslabController::class);
        Route::patch('aslabs/{aslab}/toggle-status', [AslabController::class, 'toggleStatus'])->name('aslabs.toggle-status');
    });

    // Admin and Aslab routes
    Route::middleware(['role:admin,aslab'])->group(function () {
        // Attendance related routes
        Route::get('/attendance-history', [DashboardController::class, 'attendanceHistory'])->name('attendance.history');
        Route::get('/attendance-scan', [AttendanceController::class, 'scanPage'])->name('attendance.scan');
        Route::post('/attendance-scan', [AttendanceController::class, 'processRfidScan'])->name('attendance.process');
        Route::get('/attendance-today', [AttendanceController::class, 'todaySummary'])->name('attendance.today');

        // Jadwal Piket routes
        Route::get('/jadwal-piket', [JadwalPiketController::class, 'index'])->name('jadwal-piket.index');
        Route::post('/jadwal-piket/generate', [JadwalPiketController::class, 'generateAuto'])->name('jadwal-piket.generate');
        Route::post('/jadwal-piket/update', [JadwalPiketController::class, 'updateManual'])->name('jadwal-piket.update');
        Route::post('/jadwal-piket/swap', [JadwalPiketController::class, 'swapSchedule'])->name('jadwal-piket.swap');
        Route::post('/jadwal-piket/reset', [JadwalPiketController::class, 'reset'])->name('jadwal-piket.reset');

        // Aset Aslab routes - Admin and Aslab can manage assets
        Route::get('aset-aslab/generate-kode', [AsetAslabController::class, 'generateKode'])->name('aset-aslab.generate-kode');
        Route::resource('aset-aslab', AsetAslabController::class);

        // Jenis Aset Aslab routes
        Route::post('jenis-aset-aslab', [JenisAsetAslabController::class, 'store'])->name('jenis-aset-aslab.store');
    });

    // All authenticated users can access peminjaman barang
    Route::middleware(['role:admin,aslab,mahasiswa,dosen'])->group(function () {
        // Peminjaman Barang routes - accessible to all user types
        Route::get('/peminjaman-barang/search-items', [PeminjamanBarangController::class, 'searchItems'])->name('peminjaman-barang.search-items');
        Route::resource('peminjaman-barang', PeminjamanBarangController::class);
        Route::post('/peminjaman-barang/{id}/approve', [PeminjamanBarangController::class, 'approve'])->name('peminjaman-barang.approve');
        Route::post('/peminjaman-barang/{id}/return', [PeminjamanBarangController::class, 'return'])->name('peminjaman-barang.return');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
