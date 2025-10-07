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

    private function getAttendanceStatus($checkIn, $checkOut)
    {
        if (!$checkIn) {
            return 'Belum datang';
        } elseif (!$checkOut) {
            return 'Sedang di lab';
        } else {
            return 'Sudah pulang';
        }
    }
}
