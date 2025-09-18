<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RfidRegistrationController extends Controller
{
    /**
     * Register RFID card to user
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'rfid_code' => 'required|string',
                'user_id' => 'required|exists:users,id',
            ]);

            $rfidCode = strtoupper($request->input('rfid_code'));
            $userId = $request->input('user_id');

            // Check if RFID is already registered
            $existingUser = User::where('rfid_code', $rfidCode)->first();
            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFID sudah terdaftar untuk user: ' . $existingUser->name,
                    'data' => null
                ], 400);
            }

            // Update user with RFID code
            $user = User::findOrFail($userId);
            $user->update(['rfid_code' => $rfidCode]);

            return response()->json([
                'success' => true,
                'message' => 'RFID berhasil didaftarkan',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'rfid_code' => $user->rfid_code
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('RFID Registration Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem',
                'data' => null
            ], 500);
        }
    }

    /**
     * Scan RFID for registration (just to get UID)
     */
    public function scanForRegistration(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'rfid_code' => 'required|string',
            ]);

            $rfidCode = strtoupper($request->input('rfid_code'));

            // Store in cache for web interface (expires in 1 minute)
            cache(['last_rfid_scan' => $rfidCode], now()->addMinutes(1));

            // Check if RFID is already registered
            $existingUser = User::where('rfid_code', $rfidCode)->first();

            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFID sudah terdaftar',
                    'data' => [
                        'rfid_code' => $rfidCode,
                        'registered_to' => $existingUser->name,
                        'is_registered' => true
                    ]
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'RFID tersedia untuk registrasi',
                'data' => [
                    'rfid_code' => $rfidCode,
                    'is_registered' => false
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('RFID Scan for Registration Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem',
                'data' => null
            ], 500);
        }
    }

    /**
     * Get all users for RFID registration selection
     */
    public function getUsers(): JsonResponse
    {
        try {
            $users = User::where('role', 'aslab')
                        ->select('id', 'name', 'email', 'prodi', 'semester', 'rfid_code', 'is_active')
                        ->orderBy('name')
                        ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data user berhasil diambil',
                'data' => $users
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get Users Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem',
                'data' => null
            ], 500);
        }
    }

    /**
     * Get last scanned RFID for web interface
     */
    public function getLastScan(): JsonResponse
    {
        try {
            // Get from cache or session
            $lastScan = cache('last_rfid_scan');

            if ($lastScan) {
                // Clear cache after reading
                cache()->forget('last_rfid_scan');

                return response()->json([
                    'success' => true,
                    'message' => 'Last scan retrieved',
                    'data' => [
                        'rfid_code' => $lastScan,
                        'timestamp' => now()
                    ]
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'No recent scan',
                'data' => null
            ], 404);

        } catch (\Exception $e) {
            Log::error('Get Last Scan Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem',
                'data' => null
            ], 500);
        }
    }
}
