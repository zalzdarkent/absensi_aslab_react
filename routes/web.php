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
use App\Http\Controllers\LokasiController;
use App\Http\Controllers\ImportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard - accessible to all logged-in users
    Route::match(['get', 'post'], '/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/day-detail', [DashboardController::class, 'dayDetail'])->name('dashboard.day-detail');
    Route::get('/dashboard/day-detail-data', [DashboardController::class, 'dayDetailData'])->name('dashboard.day-detail-data');
    Route::get('/attendance-today', [DashboardController::class, 'attendanceToday'])->name('attendance.today');

    // Telegram Web Routes - accessible to all authenticated users
    Route::prefix('telegram')->name('telegram.')->group(function () {
        Route::get('/status', [App\Http\Controllers\TelegramController::class, 'getTelegramStatus'])->name('status');
        Route::post('/link', [App\Http\Controllers\TelegramController::class, 'linkTelegram'])->name('link');
        Route::post('/unlink', [App\Http\Controllers\TelegramController::class, 'unlinkTelegram'])->name('unlink');
        Route::post('/toggle-notifications', [App\Http\Controllers\TelegramController::class, 'toggleNotifications'])->name('toggle-notifications');

        // Admin only routes for Telegram
        Route::middleware(['role:admin'])->group(function () {
            Route::post('/send-message', [App\Http\Controllers\TelegramController::class, 'sendCustomMessage'])->name('send-message');
            Route::get('/test-connection', [App\Http\Controllers\TelegramController::class, 'testConnection'])->name('test-connection');
        });
    });

    // Test broadcast route (for development only)
    Route::get('/test-broadcast', [App\Http\Controllers\TestController::class, 'testBroadcast'])->name('test.broadcast');

    // TEMPORARY TEST ROUTE - REMOVE AFTER TESTING
    Route::get('/test-bahan', [BahanController::class, 'create'])->name('test-bahan');

    // Admin and privileged users routes
    Route::middleware(['role_or_permission:admin|manage_users|view_users|manage_roles|manage_aslabs'])->group(function () {
        // Aslab management routes - admin or manage_aslabs (if we had it, but using manage_users for now)
        Route::resource('aslabs', AslabController::class)->middleware('role_or_permission:admin|manage_users');
        Route::patch('aslabs/{aslab}/toggle-status', [AslabController::class, 'toggleStatus'])->name('aslabs.toggle-status')->middleware('role_or_permission:admin|manage_users');

        // User management routes
        Route::resource('kelola-user', UserController::class)->parameters([
            'kelola-user' => 'user'
        ])->middleware('role_or_permission:admin|manage_users');
        Route::patch('kelola-user/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('kelola-user.toggle-status')->middleware('role_or_permission:admin|manage_users');

        // Role Management
        Route::resource('roles', \App\Http\Controllers\RoleController::class)->middleware('role_or_permission:admin|manage_roles');

        // Manual attendance routes - only admin can manually record attendance
        Route::get('/absen-piket', [AttendanceController::class, 'manualAttendancePage'])->name('attendance.manual')->middleware('role_or_permission:admin|manage_attendance');
        Route::post('/absen-piket', [AttendanceController::class, 'storeManualAttendance'])->name('attendance.manual.store')->middleware('role_or_permission:admin|manage_attendance');
        Route::get('/absen-piket/users', [AttendanceController::class, 'getUsers'])->name('attendance.manual.users')->middleware('role_or_permission:admin|manage_attendance');
    });

    // Admin and Aslab routes (Management & Attendance)
    // Using broad check here, then specific checks inside if needed, or just let users access if they have ANY relevant permission
    Route::middleware(['role_or_permission:admin|aslab|view_assets|manage_assets|view_attendance|view_picket_schedule|manage_attendance'])->group(function () {
        // Attendance related routes
        Route::get('/attendance-history', [AttendanceController::class, 'attendanceHistory'])->name('attendance.history')->middleware('role_or_permission:admin|aslab|view_attendance_history');
        Route::get('/attendance-scan', [AttendanceController::class, 'scanPage'])->name('attendance.scan')->middleware('role_or_permission:admin|aslab|manage_attendance');
        Route::post('/attendance-scan', [AttendanceController::class, 'processRfidScan'])->name('attendance.process')->middleware('role_or_permission:admin|aslab|manage_attendance');
        Route::get('/attendance-today', [AttendanceController::class, 'todaySummary'])->name('attendance.today')->middleware('role_or_permission:admin|aslab|view_attendance');

        // Jadwal Piket routes
        Route::get('/jadwal-piket', [JadwalPiketController::class, 'index'])->name('jadwal-piket.index')->middleware('role_or_permission:admin|aslab|view_picket_schedule');
        Route::post('/jadwal-piket/generate', [JadwalPiketController::class, 'generateAuto'])->name('jadwal-piket.generate')->middleware('role_or_permission:admin|manage_attendance');
        Route::post('/jadwal-piket/update', [JadwalPiketController::class, 'updateManual'])->name('jadwal-piket.update')->middleware('role_or_permission:admin|manage_attendance');
        Route::post('/jadwal-piket/swap', [JadwalPiketController::class, 'swapSchedule'])->name('jadwal-piket.swap')->middleware('role_or_permission:admin|aslab|manage_attendance'); // Aslab usually can swap?
        Route::post('/jadwal-piket/batch-update', [JadwalPiketController::class, 'batchUpdate'])->name('jadwal-piket.batch-update')->middleware('role_or_permission:admin|manage_attendance');
        Route::post('/jadwal-piket/reset', [JadwalPiketController::class, 'reset'])->name('jadwal-piket.reset')->middleware('role_or_permission:admin|manage_attendance');

        // Absensi Praktikum routes
        Route::prefix('absensi-praktikum')->name('absensi-praktikum.')->middleware('role_or_permission:admin|aslab|view_attendance')->group(function () {
            // Kelas
            Route::get('kelas/search', [App\Http\Controllers\KelasController::class, 'search'])->name('kelas.search');
            Route::post('kelas/bulk-delete', [App\Http\Controllers\KelasController::class, 'bulkDelete'])->name('kelas.bulk-delete')->middleware('role_or_permission:admin|aslab|manage_attendance');
            Route::resource('kelas', App\Http\Controllers\KelasController::class);

            // Mata Kuliah Praktikum
            Route::post('mata-kuliah-praktikum/bulk-delete', [App\Http\Controllers\MataKuliahPraktikumController::class, 'bulkDelete'])->name('mata-kuliah-praktikum.bulk-delete')->middleware('role_or_permission:admin|aslab|manage_attendance');
            Route::resource('mata-kuliah-praktikum', App\Http\Controllers\MataKuliahPraktikumController::class);

            // Dosen Praktikum
            Route::get('dosen-praktikum/search', [App\Http\Controllers\DosenPraktikumController::class, 'search'])->name('dosen-praktikum.search');
            Route::post('dosen-praktikum/bulk-delete', [App\Http\Controllers\DosenPraktikumController::class, 'bulkDelete'])->name('dosen-praktikum.bulk-delete')->middleware('role_or_permission:admin|aslab|manage_attendance');
            Route::resource('dosen-praktikum', App\Http\Controllers\DosenPraktikumController::class);

            // Kelas Praktikum
            Route::get('kelas-praktikum/search', [App\Http\Controllers\KelasPraktikumController::class, 'search'])->name('kelas-praktikum.search');
            Route::resource('kelas-praktikum', App\Http\Controllers\KelasPraktikumController::class);

            // Absensi Praktikum
            Route::post('absensi/bulk-delete', [App\Http\Controllers\AbsensiPraktikumController::class, 'bulkDelete'])->name('absensi.bulk-delete')->middleware('role_or_permission:admin|aslab|manage_attendance');
            Route::resource('absensi', App\Http\Controllers\AbsensiPraktikumController::class)->parameters([
                'absensi' => 'absensiPraktikum'
            ]);
        });

        // Aset Aslab routes - Admin and Aslab can manage assets
        Route::get('aset-aslab/generate-kode', [AsetAslabController::class, 'generateKode'])->name('aset-aslab.generate-kode')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::post('aset-aslab-bulk-delete', [AsetAslabController::class, 'bulkDelete'])->name('aset-aslab.bulk-delete')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::resource('aset-aslab', AsetAslabController::class)->middleware('role_or_permission:admin|aslab|view_assets');

        // Jenis Aset Aslab routes
        Route::post('jenis-aset-aslab', [JenisAsetAslabController::class, 'store'])->name('jenis-aset-aslab.store')->middleware('role_or_permission:admin|aslab|manage_assets');

        // Lokasi routes
        Route::post('lokasi', [LokasiController::class, 'store'])->name('lokasi.store')->middleware('role_or_permission:admin|aslab|manage_assets');

        // Bahan routes - Admin and Aslab can manage bahan
        Route::get('bahan/create', [BahanController::class, 'create'])->name('bahan.create')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::post('bahan', [BahanController::class, 'store'])->name('bahan.store')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::get('bahan/{bahan}', [BahanController::class, 'show'])->name('bahan.show')->middleware('role_or_permission:admin|aslab|view_assets');
        Route::get('bahan/{bahan}/edit', [BahanController::class, 'edit'])->name('bahan.edit')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::put('bahan/{bahan}', [BahanController::class, 'update'])->name('bahan.update')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::delete('bahan/{bahan}', [BahanController::class, 'destroy'])->name('bahan.destroy')->middleware('role_or_permission:admin|aslab|manage_assets');

        // Peminjaman Barang Bulk Actions
        Route::post('peminjaman-barang-bulk-delete', [PeminjamanBarangController::class, 'bulkDelete'])->name('peminjaman-barang.bulk-delete')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::post('peminjaman-barang-bulk-approve', [PeminjamanBarangController::class, 'bulkApprove'])->name('peminjaman-barang.bulk-approve')->middleware('role_or_permission:admin|aslab|approve_loans');
        Route::post('peminjaman-barang-bulk-reject', [PeminjamanBarangController::class, 'bulkReject'])->name('peminjaman-barang.bulk-reject')->middleware('role_or_permission:admin|aslab|approve_loans');
        Route::post('peminjaman-barang-bulk-return', [PeminjamanBarangController::class, 'bulkReturn'])->name('peminjaman-barang.bulk-return')->middleware('role_or_permission:admin|aslab|approve_loans');

        // Import routes
        Route::post('import/aset', [ImportController::class, 'importAset'])->name('import.aset')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::post('import/bahan', [ImportController::class, 'importBahan'])->name('import.bahan')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::post('import/bulk-images', [ImportController::class, 'bulkUploadImages'])->name('import.bulk-images')->middleware('role_or_permission:admin|aslab|manage_assets');
        Route::post('import/preview', [ImportController::class, 'preview'])->name('import.preview')->middleware('role_or_permission:admin|aslab|manage_assets');
    });

    // All authenticated users can access peminjaman barang and aset
    Route::middleware(['role:admin|aslab|mahasiswa|dosen'])->group(function () {
        // Notification routes
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');

        // Peminjaman Barang routes - accessible to all user types (handles both aset and bahan)
        Route::get('/peminjaman-barang/search-items', [PeminjamanBarangController::class, 'searchItems'])->name('peminjaman-barang.search-items');
        Route::get('/peminjaman-barang/{id}/export-pdf', [PeminjamanBarangController::class, 'exportPdf'])->name('peminjaman-barang.export-pdf');
        Route::resource('peminjaman-barang', PeminjamanBarangController::class)->parameters([
            'peminjaman-barang' => 'id'
        ])->where([
            'id' => '[a-zA-Z0-9_]+' // Allow alphanumeric and underscore
        ]);
        Route::post('/peminjaman-barang/{id}/approve', [PeminjamanBarangController::class, 'approve'])
            ->where('id', '[a-zA-Z0-9_]+')
            ->name('peminjaman-barang.approve');
        Route::post('/peminjaman-barang/{id}/return', [PeminjamanBarangController::class, 'return'])
            ->where('id', '[a-zA-Z0-9_]+')
            ->name('peminjaman-barang.return');
    });
});

// Public route for NFC Picket View
Route::get('/piket/v/{rfidCode}', [JadwalPiketController::class, 'standaloneView'])->name('piket.standalone');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
