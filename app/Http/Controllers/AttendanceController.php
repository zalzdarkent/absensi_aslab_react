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
}
