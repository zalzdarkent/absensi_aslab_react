<?php

use App\Http\Controllers\AslabController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JadwalPiketController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/attendance-history', [DashboardController::class, 'attendanceHistory'])->name('attendance.history');

    // Aslab management routes
    Route::resource('aslabs', AslabController::class);
    Route::patch('aslabs/{aslab}/toggle-status', [AslabController::class, 'toggleStatus'])->name('aslabs.toggle-status');

    // Jadwal Piket routes
    Route::get('/jadwal-piket', [JadwalPiketController::class, 'index'])->name('jadwal-piket.index');
    Route::post('/jadwal-piket/generate', [JadwalPiketController::class, 'generateAuto'])->name('jadwal-piket.generate');
    Route::post('/jadwal-piket/update', [JadwalPiketController::class, 'updateManual'])->name('jadwal-piket.update');
    Route::post('/jadwal-piket/swap', [JadwalPiketController::class, 'swapSchedule'])->name('jadwal-piket.swap');
    Route::post('/jadwal-piket/reset', [JadwalPiketController::class, 'reset'])->name('jadwal-piket.reset');

    // RFID Attendance Scan routes
    Route::get('/attendance-scan', [AttendanceController::class, 'scanPage'])->name('attendance.scan');
    Route::post('/attendance-scan', [AttendanceController::class, 'processRfidScan'])->name('attendance.process');
    Route::get('/attendance-today', [AttendanceController::class, 'todaySummary'])->name('attendance.today');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
