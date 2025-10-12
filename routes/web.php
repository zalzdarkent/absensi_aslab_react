<?php

use App\Http\Controllers\AslabController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JadwalPiketController;
use App\Http\Controllers\AsetAslabController;
use App\Http\Controllers\JenisAsetAslabController;
use App\Http\Controllers\PeminjamanBarangController;
use App\Http\Controllers\BahanController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard - accessible to all logged-in users
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/attendance-today', [DashboardController::class, 'attendanceToday'])->name('attendance.today');

    // Test broadcast route (for development only)
    Route::get('/test-broadcast', [App\Http\Controllers\TestController::class, 'testBroadcast'])->name('test.broadcast');

    // TEMPORARY TEST ROUTE - REMOVE AFTER TESTING
    Route::get('/test-bahan', [BahanController::class, 'create'])->name('test-bahan');

    // Admin only routes
    Route::middleware(['role:admin'])->group(function () {
        // Aslab management routes - only admin can manage aslabs
        Route::resource('aslabs', AslabController::class);
        Route::patch('aslabs/{aslab}/toggle-status', [AslabController::class, 'toggleStatus'])->name('aslabs.toggle-status');

        // User management routes - only admin can manage all users
        Route::resource('kelola-user', UserController::class);
        Route::patch('kelola-user/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('kelola-user.toggle-status');

        // Manual attendance routes - only admin can manually record attendance
        Route::get('/absen-piket', [AttendanceController::class, 'manualAttendancePage'])->name('attendance.manual');
        Route::post('/absen-piket', [AttendanceController::class, 'storeManualAttendance'])->name('attendance.manual.store');
        Route::get('/absen-piket/users', [AttendanceController::class, 'getUsers'])->name('attendance.manual.users');
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

        // Bahan routes - Admin and Aslab can manage bahan
        Route::get('bahan/create', [BahanController::class, 'create'])->name('bahan.create');
        Route::post('bahan', [BahanController::class, 'store'])->name('bahan.store');
        Route::get('bahan/{bahan}', [BahanController::class, 'show'])->name('bahan.show');
        Route::get('bahan/{bahan}/edit', [BahanController::class, 'edit'])->name('bahan.edit');
        Route::put('bahan/{bahan}', [BahanController::class, 'update'])->name('bahan.update');
        Route::delete('bahan/{bahan}', [BahanController::class, 'destroy'])->name('bahan.destroy');
    });

    // All authenticated users can access peminjaman barang and aset
    Route::middleware(['role:admin,aslab,mahasiswa,dosen'])->group(function () {
        // Notification routes
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');

        // Peminjaman Barang routes - accessible to all user types
        Route::get('/peminjaman-barang/search-items', [PeminjamanBarangController::class, 'searchItems'])->name('peminjaman-barang.search-items');
        Route::resource('peminjaman-barang', PeminjamanBarangController::class);
        Route::post('/peminjaman-barang/{id}/approve', [PeminjamanBarangController::class, 'approve'])->name('peminjaman-barang.approve');
        Route::post('/peminjaman-barang/{id}/return', [PeminjamanBarangController::class, 'return'])->name('peminjaman-barang.return');

        // Peminjaman Aset routes - accessible to all user types
        Route::get('/peminjaman-aset', [PeminjamanBarangController::class, 'indexAset'])->name('peminjaman-aset.index');
        Route::get('/peminjaman-aset/create', [PeminjamanBarangController::class, 'createAset'])->name('peminjaman-aset.create');
        Route::post('/peminjaman-aset', [PeminjamanBarangController::class, 'storeAset'])->name('peminjaman-aset.store');
        Route::get('/peminjaman-aset/{id}', [PeminjamanBarangController::class, 'showAset'])->name('peminjaman-aset.show');
        Route::post('/peminjaman-aset/{id}/approve', [PeminjamanBarangController::class, 'approveAset'])->name('peminjaman-aset.approve');
        Route::post('/peminjaman-aset/{id}/reject', [PeminjamanBarangController::class, 'rejectAset'])->name('peminjaman-aset.reject');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
