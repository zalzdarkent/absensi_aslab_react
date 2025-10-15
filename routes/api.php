<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RfidController;
use App\Http\Controllers\Api\RfidRegistrationController;
use App\Http\Controllers\Api\ItemSearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Authentication Routes (tanpa middleware auth)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected Authentication Routes (dengan auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);

    // User info endpoint
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Item Search API Routes
    Route::get('/items/search', [ItemSearchController::class, 'search']);

    // Dashboard API Routes
});

// RFID API Routes (tanpa auth untuk hardware RFID)
Route::prefix('rfid')->group(function () {
    Route::post('/scan', [RfidController::class, 'scan']);
    Route::get('/status', [RfidController::class, 'status']);

    // RFID Registration Routes
    Route::post('/register', [RfidRegistrationController::class, 'register']);
    Route::post('/scan-for-registration', [RfidRegistrationController::class, 'scanForRegistration']);
    Route::get('/users', [RfidRegistrationController::class, 'getUsers']);
    Route::get('/last-scan', [RfidRegistrationController::class, 'getLastScan']);

    // RFID Attendance Routes
    Route::post('/scan-for-attendance', [RfidController::class, 'scanForAttendance']);
    Route::get('/attendance-logs', [RfidController::class, 'getAttendanceLogs']);
    Route::get('/attendance-today', [RfidController::class, 'getTodayAttendance']);

    // RFID Mode Command Routes
    Route::get('/get-mode-command', [RfidController::class, 'getModeCommand']);
    Route::post('/set-mode', [RfidController::class, 'setMode']);

    // Test broadcast endpoint
    Route::post('/test-broadcast', [RfidController::class, 'testBroadcast']);
});
