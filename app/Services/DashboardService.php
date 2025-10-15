<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    public function getDashboardStats()
    {
        $today = now()->toDateString();

        // Get stats
        $totalAslabs = User::where('role', 'aslab')->where('is_active', true)->count();
        $todayCheckins = Attendance::where('date', $today)->where('type', 'check_in')->count();
        $todayCheckouts = Attendance::where('date', $today)->where('type', 'check_out')->count();
        $activeToday = $todayCheckins - $todayCheckouts;

        return [
            'total_aslabs' => $totalAslabs,
            'today_checkins' => $todayCheckins,
            'today_checkouts' => $todayCheckouts,
            'active_today' => max(0, $activeToday), // Ensure non-negative
        ];
    }

    public function getTodayAttendances()
    {
        $today = now()->toDateString();

        // Today's attendance list
        $todayAttendances = Attendance::with('user')
            ->where('date', $today)
            ->get()
            ->groupBy('user_id')
            ->map(function ($userAttendances) {
                $user = $userAttendances->first()->user;
                $checkIn = $userAttendances->where('type', 'check_in')->first();
                $checkOut = $userAttendances->where('type', 'check_out')->first();

                Log::info('User attendance debug', [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'check_in_exists' => $checkIn ? true : false,
                    'check_out_exists' => $checkOut ? true : false,
                    'check_in_time' => $checkIn ? $checkIn->timestamp->format('H:i:s') : null,
                    'check_out_time' => $checkOut ? $checkOut->timestamp->format('H:i:s') : null,
                ]);

                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'prodi' => $user->prodi,
                        'semester' => $user->semester,
                    ],
                    'check_in' => $checkIn ? $checkIn->timestamp->format('H:i:s') : null,
                    'check_out' => $checkOut ? $checkOut->timestamp->format('H:i:s') : null,
                    'status' => $this->getAttendanceStatus($checkIn, $checkOut),
                ];
            })
            ->values();

        return $todayAttendances;
    }

    public function getMostActiveAslabs()
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        Log::info('Getting most active aslabs', [
            'current_month' => $currentMonth,
            'current_year' => $currentYear
        ]);

        // Most active aslabs this month
        $mostActiveAslabs = User::where('role', 'aslab')
            ->where('is_active', true)
            ->withCount([
                'attendances' => function ($query) use ($currentMonth, $currentYear) {
                    $query->whereYear('date', $currentYear)
                          ->whereMonth('date', $currentMonth)
                          ->where('type', 'check_in');
                }
            ])
            ->orderBy('attendances_count', 'desc')
            ->limit(10)
            ->get();

        Log::info('Query result before mapping', [
            'users_count' => $mostActiveAslabs->count(),
            'users_data' => $mostActiveAslabs->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'attendances_count' => $user->attendances_count
                ];
            })
        ]);

        $result = $mostActiveAslabs->map(function ($user) {
                return [
                    'name' => $user->name,
                    'prodi' => $user->prodi,
                    'semester' => $user->semester,
                    'total_attendance' => $user->attendances_count,
                ];
            });

        Log::info('Final most active aslabs result', ['result' => $result]);

        return $result;
    }

    public function getWeeklyChartData()
    {
        // Weekly attendance chart data
        $weeklyData = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $count = Attendance::where('date', $date)
                              ->where('type', 'check_in')
                              ->count();
            $weeklyData->push([
                'date' => Carbon::parse($date)->format('d/m'),
                'count' => $count,
            ]);
        }

        return $weeklyData;
    }

    public function getAllDashboardData()
    {
        return [
            'stats' => $this->getDashboardStats(),
            'todayAttendances' => $this->getTodayAttendances(),
            'mostActiveAslabs' => $this->getMostActiveAslabs(),
            'weeklyChartData' => $this->getWeeklyChartData(),
        ];
    }

    public function getDayDetail($date)
    {
        Log::info('getDayDetail called with date: ' . $date);

        try {
            // Coba parsing format d/m dulu
            $carbonDate = Carbon::createFromFormat('d/m', $date);
            $carbonDate->year = now()->year; // Set to current year
            $dateString = $carbonDate->toDateString();
            Log::info('Parsed d/m format', ['original' => $date, 'parsed' => $dateString]);
        } catch (\Exception $e) {
            // If date format is already Y-m-d
            try {
                $carbonDate = Carbon::createFromFormat('Y-m-d', $date);
                $dateString = $carbonDate->toDateString();
                Log::info('Parsed Y-m-d format', ['original' => $date, 'parsed' => $dateString]);
            } catch (\Exception $e2) {
                Log::error('Failed to parse date', ['date' => $date, 'error1' => $e->getMessage(), 'error2' => $e2->getMessage()]);
                throw new \Exception('Invalid date format: ' . $date);
            }
        }

        Log::info('Getting day detail for date', ['date' => $dateString]);

        // Get all attendances for the specific date
        $attendances = Attendance::with('user')
            ->where('date', $dateString)
            ->get();

        Log::info('Raw attendances found', ['count' => $attendances->count(), 'data' => $attendances->toArray()]);

        $groupedAttendances = $attendances->groupBy('user_id')
            ->map(function ($userAttendances) use ($dateString) {
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
                    'check_in' => $checkIn ? $checkIn->timestamp->toISOString() : null,
                    'check_out' => $checkOut ? $checkOut->timestamp->toISOString() : null,
                    'status' => $this->getDayDetailStatus($checkIn, $checkOut),
                    'date' => $dateString,
                ];
            })
            ->values();

        Log::info('Day detail result', ['count' => $groupedAttendances->count(), 'data' => $groupedAttendances->toArray()]);

        return $groupedAttendances;
    }

    private function getDayDetailStatus($checkIn, $checkOut)
    {
        if ($checkIn && $checkOut) {
            return 'present'; // Hadir lengkap
        } elseif ($checkIn || $checkOut) {
            return 'partial'; // Hadir sebagian
        } else {
            return 'absent'; // Tidak hadir
        }
    }

    private function getAttendanceStatus($checkIn, $checkOut)
    {
        if (!$checkIn) {
            return 'Sedang di lab';
        } elseif (!$checkOut) {
            return 'Sedang di lab';
        } else {
            return 'Sudah pulang';
        }
    }
}
