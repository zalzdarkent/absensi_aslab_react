<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Show attendance scan page
     */
    public function scanPage()
    {
        return Inertia::render('attendance-scan');
    }

    /**
     * Process RFID scan for attendance
     */
    public function processRfidScan(Request $request)
    {
        $request->validate([
            'rfid_code' => 'required|string',
        ]);

        $rfidCode = strtoupper($request->input('rfid_code'));

        // Store in cache for web interface real-time detection (expires in 1 minute)
        cache(['last_rfid_scan' => $rfidCode], now()->addMinutes(1));

        // Find user by RFID
        $user = User::where('rfid_code', $rfidCode)
                   ->where('role', 'aslab')
                   ->where('is_active', true)
                   ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'RFID tidak terdaftar atau user tidak aktif'
            ], 404);
        }

        $today = Carbon::today();
        $now = Carbon::now();

        // Check if already checked in today
        $todayCheckIn = $user->attendances()
                           ->where('date', $today)
                           ->where('type', 'check_in')
                           ->first();

        if (!$todayCheckIn) {
            // Create check-in record
            $attendance = Attendance::create([
                'user_id' => $user->id,
                'type' => 'check_in',
                'timestamp' => $now,
                'date' => $today,
                'notes' => 'RFID Scan'
            ]);

            return response()->json([
                'success' => true,
                'type' => 'check_in',
                'message' => "Selamat datang, {$user->name}! Check-in berhasil pada " . $now->format('H:i'),
                'user' => [
                    'name' => $user->name,
                    'prodi' => $user->prodi,
                    'semester' => $user->semester,
                ],
                'time' => $now->format('H:i:s')
            ]);
        }

        // Check if already checked out today
        $todayCheckOut = $user->attendances()
                            ->where('date', $today)
                            ->where('type', 'check_out')
                            ->first();

        if (!$todayCheckOut) {
            // Create check-out record
            $attendance = Attendance::create([
                'user_id' => $user->id,
                'type' => 'check_out',
                'timestamp' => $now,
                'date' => $today,
                'notes' => 'RFID Scan'
            ]);

            return response()->json([
                'success' => true,
                'type' => 'check_out',
                'message' => "Sampai jumpa, {$user->name}! Check-out berhasil pada " . $now->format('H:i'),
                'user' => [
                    'name' => $user->name,
                    'prodi' => $user->prodi,
                    'semester' => $user->semester,
                ],
                'time' => $now->format('H:i:s')
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => "Anda sudah melakukan check-in dan check-out hari ini."
        ], 400);
    }

    /**
     * Get today's attendance summary
     */
    public function todaySummary()
    {
        $today = Carbon::today();

        $attendances = Attendance::with('user')
            ->where('date', $today)
            ->orderBy('timestamp', 'desc')
            ->get()
            ->groupBy('user_id')
            ->map(function ($userAttendances) {
                $user = $userAttendances->first()->user;
                $checkIn = $userAttendances->where('type', 'check_in')->first();
                $checkOut = $userAttendances->where('type', 'check_out')->first();

                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'prodi' => $user->prodi,
                        'semester' => $user->semester,
                    ],
                    'check_in' => $checkIn ? $checkIn->timestamp->format('H:i') : null,
                    'check_out' => $checkOut ? $checkOut->timestamp->format('H:i') : null,
                    'status' => $checkOut ? 'Sudah Pulang' : ($checkIn ? 'Sedang di Lab' : 'Belum Datang'),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $attendances
        ]);
    }

    /**
     * Show manual attendance page (Admin only)
     */
    public function manualAttendancePage()
    {
        // Get all aslabs for manual attendance
        $aslabs = User::where('role', 'aslab')
                     ->where('is_active', true)
                     ->select('id', 'name', 'prodi', 'semester')
                     ->orderBy('name')
                     ->get();

        // Get today's attendance to show current status
        $today = Carbon::today();
        $todayAttendances = Attendance::with('user')
            ->where('date', $today)
            ->get()
            ->groupBy('user_id')
            ->map(function ($userAttendances) {
                $checkIn = $userAttendances->where('type', 'check_in')->first();
                $checkOut = $userAttendances->where('type', 'check_out')->first();
                
                return [
                    'check_in' => $checkIn ? $checkIn->timestamp->format('H:i') : null,
                    'check_out' => $checkOut ? $checkOut->timestamp->format('H:i') : null,
                    'check_in_method' => $checkIn ? $checkIn->notes : null,
                    'check_out_method' => $checkOut ? $checkOut->notes : null,
                ];
            });

        return Inertia::render('AbsenPiket', [
            'aslabs' => $aslabs,
            'todayAttendances' => $todayAttendances,
        ]);
    }

    /**
     * Store manual attendance (Admin only)
     */
    public function storeManualAttendance(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:check_in,check_out',
            'notes' => 'nullable|string|max:255',
        ]);

        $userId = $request->input('user_id');
        $type = $request->input('type');
        $notes = $request->input('notes', 'Manual entry by admin');
        $today = Carbon::today();
        $now = Carbon::now();

        // Verify user is aslab
        $user = User::where('id', $userId)
                   ->where('role', 'aslab')
                   ->where('is_active', true)
                   ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan atau bukan aslab aktif'
            ], 404);
        }

        // Check existing attendance for today
        $existingAttendance = Attendance::where('user_id', $userId)
                                      ->where('date', $today)
                                      ->where('type', $type)
                                      ->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => false,
                'message' => "User sudah melakukan {$type} hari ini"
            ], 400);
        }

        // For check_out, ensure check_in exists
        if ($type === 'check_out') {
            $checkIn = Attendance::where('user_id', $userId)
                                ->where('date', $today)
                                ->where('type', 'check_in')
                                ->first();

            if (!$checkIn) {
                return response()->json([
                    'success' => false,
                    'message' => 'User belum check-in hari ini'
                ], 400);
            }
        }

        // Create attendance record
        $attendance = Attendance::create([
            'user_id' => $userId,
            'type' => $type,
            'timestamp' => $now,
            'date' => $today,
            'notes' => $notes
        ]);

        return response()->json([
            'success' => true,
            'message' => "Manual {$type} berhasil untuk {$user->name}",
            'data' => [
                'user' => $user,
                'type' => $type,
                'timestamp' => $now->format('H:i:s'),
                'notes' => $notes
            ]
        ]);
    }

    /**
     * Get users for manual attendance
     */
    public function getUsers()
    {
        $aslabs = User::where('role', 'aslab')
                     ->where('is_active', true)
                     ->select('id', 'name', 'prodi', 'semester')
                     ->orderBy('name')
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $aslabs
        ]);
    }
}
