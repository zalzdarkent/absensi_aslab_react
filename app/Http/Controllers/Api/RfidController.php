<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RfidController extends Controller
{
    /**
     * Handle RFID scan for attendance
     */
    public function scan(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'rfid_code' => 'required|string',
            ]);

            $rfidCode = $request->input('rfid_code');

            // Find user by RFID code
            $user = User::where('rfid_code', $rfidCode)
                       ->where('is_active', true)
                       ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFID tidak terdaftar atau tidak aktif',
                    'data' => null
                ], 404);
            }

            $today = now()->toDateString();
            $now = now();

            // Check if user has already checked in today
            $todayCheckIn = Attendance::where('user_id', $user->id)
                                    ->where('date', $today)
                                    ->where('type', 'check_in')
                                    ->first();

            // Check if user has already checked out today
            $todayCheckOut = Attendance::where('user_id', $user->id)
                                     ->where('date', $today)
                                     ->where('type', 'check_out')
                                     ->first();

            DB::beginTransaction();

            if (!$todayCheckIn) {
                // First scan of the day - CHECK IN
                $attendance = Attendance::create([
                    'user_id' => $user->id,
                    'type' => 'check_in',
                    'timestamp' => $now,
                    'date' => $today,
                    'notes' => 'Check-in via RFID'
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => "Selamat datang, {$user->name}! Check-in berhasil.",
                    'data' => [
                        'user' => [
                            'name' => $user->name,
                            'prodi' => $user->prodi,
                            'semester' => $user->semester
                        ],
                        'attendance' => [
                            'type' => 'check_in',
                            'timestamp' => $attendance->timestamp->format('H:i:s'),
                            'date' => Carbon::parse($attendance->date)->format('d/m/Y')
                        ]
                    ]
                ], 200);

            } elseif (!$todayCheckOut) {
                // Second scan of the day - CHECK OUT
                $attendance = Attendance::create([
                    'user_id' => $user->id,
                    'type' => 'check_out',
                    'timestamp' => $now,
                    'date' => $today,
                    'notes' => 'Check-out via RFID'
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => "Sampai jumpa, {$user->name}! Check-out berhasil.",
                    'data' => [
                        'user' => [
                            'name' => $user->name,
                            'prodi' => $user->prodi,
                            'semester' => $user->semester
                        ],
                        'attendance' => [
                            'type' => 'check_out',
                            'timestamp' => $attendance->timestamp->format('H:i:s'),
                            'date' => Carbon::parse($attendance->date)->format('d/m/Y')
                        ]
                    ]
                ], 200);

            } else {
                // Already checked in and out today
                DB::rollback();

                return response()->json([
                    'success' => false,
                    'message' => "Anda sudah check-in dan check-out hari ini.",
                    'data' => [
                        'user' => [
                            'name' => $user->name,
                            'prodi' => $user->prodi,
                            'semester' => $user->semester
                        ],
                        'today_attendances' => [
                            'check_in' => $todayCheckIn->timestamp->format('H:i:s'),
                            'check_out' => $todayCheckOut->timestamp->format('H:i:s')
                        ]
                    ]
                ], 400);
            }

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('RFID Scan Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem',
                'data' => null
            ], 500);
        }
    }

    /**
     * Get attendance status for RFID code
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'rfid_code' => 'required|string',
            ]);

            $rfidCode = $request->input('rfid_code');

            $user = User::where('rfid_code', $rfidCode)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFID tidak terdaftar',
                    'data' => null
                ], 404);
            }

            $today = now()->toDateString();

            $todayAttendances = Attendance::where('user_id', $user->id)
                                        ->where('date', $today)
                                        ->orderBy('timestamp')
                                        ->get();

            return response()->json([
                'success' => true,
                'message' => 'Status absensi berhasil diambil',
                'data' => [
                    'user' => [
                        'name' => $user->name,
                        'prodi' => $user->prodi,
                        'semester' => $user->semester,
                        'is_active' => $user->is_active
                    ],
                    'today_attendances' => $todayAttendances->map(function ($attendance) {
                        return [
                            'type' => $attendance->type,
                            'timestamp' => $attendance->timestamp->format('H:i:s'),
                            'notes' => $attendance->notes
                        ];
                    })
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('RFID Status Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem',
                'data' => null
            ], 500);
        }
    }

    /**
     * Handle RFID scan specifically for attendance (alias for scan method)
     */
    public function scanForAttendance(Request $request): JsonResponse
    {
        return $this->scan($request);
    }

    /**
     * Get attendance logs with pagination
     */
    public function getAttendanceLogs(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 15);
            $date = $request->input('date'); // Optional date filter

            $query = Attendance::with('user')
                              ->orderBy('timestamp', 'desc');

            if ($date) {
                $query->where('date', $date);
            }

            $attendances = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil diambil',
                'data' => [
                    'attendances' => $attendances->items(),
                    'pagination' => [
                        'current_page' => $attendances->currentPage(),
                        'last_page' => $attendances->lastPage(),
                        'per_page' => $attendances->perPage(),
                        'total' => $attendances->total()
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get Attendance Logs Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem',
                'data' => null
            ], 500);
        }
    }

    /**
     * Get today's attendance summary
     */
    public function getTodayAttendance(Request $request): JsonResponse
    {
        try {
            $today = now()->toDateString();

            $attendances = Attendance::with('user')
                                   ->where('date', $today)
                                   ->orderBy('timestamp', 'desc')
                                   ->get();

            // Group by user and type
            $summary = [];
            $checkInCount = 0;
            $checkOutCount = 0;

            foreach ($attendances as $attendance) {
                $userId = $attendance->user_id;

                if (!isset($summary[$userId])) {
                    $summary[$userId] = [
                        'user' => [
                            'id' => $attendance->user->id,
                            'name' => $attendance->user->name,
                            'prodi' => $attendance->user->prodi,
                            'semester' => $attendance->user->semester
                        ],
                        'check_in' => null,
                        'check_out' => null,
                        'status' => 'absent'
                    ];
                }

                if ($attendance->type === 'check_in') {
                    $summary[$userId]['check_in'] = $attendance->timestamp->format('H:i:s');
                    $summary[$userId]['status'] = 'present';
                    if (!isset($summary[$userId]['counted_check_in'])) {
                        $checkInCount++;
                        $summary[$userId]['counted_check_in'] = true;
                    }
                } elseif ($attendance->type === 'check_out') {
                    $summary[$userId]['check_out'] = $attendance->timestamp->format('H:i:s');
                    if (!isset($summary[$userId]['counted_check_out'])) {
                        $checkOutCount++;
                        $summary[$userId]['counted_check_out'] = true;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Data absensi hari ini berhasil diambil',
                'data' => [
                    'date' => Carbon::parse($today)->format('d/m/Y'),
                    'summary' => [
                        'total_check_in' => $checkInCount,
                        'total_check_out' => $checkOutCount,
                        'active_users' => count($summary)
                    ],
                    'attendances' => array_values($summary)
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get Today Attendance Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem',
                'data' => null
            ], 500);
        }
    }

    /**
     * Get current mode command for ESP32
     */
    public function getModeCommand()
    {
        $mode = Cache::get('rfid_mode', 'registration');

        return response()->json([
            'mode' => $mode
        ]);
    }

    /**
     * Set mode for ESP32
     */
    public function setMode(Request $request)
    {
        $request->validate([
            'mode' => 'required|in:registration,check_in,check_out'
        ]);

        $mode = $request->input('mode');
        Cache::put('rfid_mode', $mode, now()->addHours(24));

        return response()->json([
            'success' => true,
            'mode' => $mode,
            'message' => "Mode set to {$mode}"
        ]);
    }
}
