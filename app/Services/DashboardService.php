<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    public function getDashboardStats($startDate = null, $endDate = null)
    {
        $startDate = $startDate ?: now()->toDateString();
        $endDate = $endDate ?: $startDate;

        // Get stats
        $totalAslabs = User::where('role', 'aslab')->where('is_active', true)->count();
        $todayCheckins = Attendance::whereBetween('date', [$startDate, $endDate])->where('type', 'check_in')->count();
        $todayCheckouts = Attendance::whereBetween('date', [$startDate, $endDate])->where('type', 'check_out')->count();

        // Active today only makes sense if the range includes today
        $today = now()->toDateString();
        $activeToday = 0;
        if ($startDate <= $today && $endDate >= $today) {
            $activeToday = Attendance::where('date', $today)->where('type', 'check_in')->count() -
                          Attendance::where('date', $today)->where('type', 'check_out')->count();
        }

        return [
            'total_aslabs' => $totalAslabs,
            'today_checkins' => $todayCheckins,
            'today_checkouts' => $todayCheckouts,
            'active_today' => max(0, $activeToday), // Ensure non-negative
        ];
    }

    public function getTodayAttendances($startDate = null, $endDate = null)
    {
        $startDate = $startDate ?: now()->toDateString();
        $endDate = $endDate ?: $startDate;

        // Attendance list for the period
        $attendances = Attendance::with('user')
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('timestamp', 'desc')
            ->get()
            ->groupBy(function($item) {
                return $item->user_id . '_' . $item->date;
            })
            ->map(function ($userDateAttendances) {
                $first = $userDateAttendances->first();
                $user = $first->user;
                $checkIn = $userDateAttendances->where('type', 'check_in')->first();
                $checkOut = $userDateAttendances->where('type', 'check_out')->first();

                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'prodi' => $user->prodi,
                        'semester' => $user->semester,
                    ],
                    'date' => \Illuminate\Support\Carbon::parse($first->date)->format('Y-m-d'),
                    'check_in' => $checkIn ? $checkIn->timestamp->format('H:i:s') : null,
                    'check_out' => $checkOut ? $checkOut->timestamp->format('H:i:s') : null,
                    'status' => $this->getAttendanceStatus($checkIn, $checkOut),
                ];
            })
            ->values();

        return $attendances;
    }

    public function getMostActiveAslabs($startDate = null, $endDate = null)
    {
        $startDate = $startDate ?: now()->startOfMonth()->toDateString();
        $endDate = $endDate ?: now()->toDateString();

        Log::info('Getting most active aslabs', [
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);

        // Most active aslabs in the period
        $mostActiveAslabs = User::where('role', 'aslab')
            ->where('is_active', true)
            ->withCount([
                'attendances' => function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('date', [$startDate, $endDate])
                          ->where('type', 'check_in');
                }
            ])
            ->orderBy('attendances_count', 'desc')
            ->limit(10)
            ->get();

        $result = $mostActiveAslabs->map(function ($user) {
                return [
                    'name' => $user->name,
                    'prodi' => $user->prodi,
                    'semester' => $user->semester,
                    'total_attendance' => $user->attendances_count,
                ];
            });

        return $result;
    }

    public function getWeeklyChartData($startDate = null, $endDate = null)
    {
        if (!$startDate || !$endDate) {
            $endDate = now();
            $startDate = now()->subDays(6);
        } else {
            $startDate = Carbon::parse($startDate);
            $endDate = Carbon::parse($endDate);
        }

        $diffInDays = $startDate->diffInDays($endDate);

        // Weekly attendance chart data
        $chartData = collect();

        // If range is small (<= 31 days), show daily
        if ($diffInDays <= 31) {
            for ($date = clone $startDate; $date <= $endDate; $date->addDay()) {
                $dateString = $date->toDateString();
                $count = Attendance::where('date', $dateString)
                                  ->where('type', 'check_in')
                                  ->count();
                $chartData->push([
                    'date' => $date->format('d/m'),
                    'count' => $count,
                ]);
            }
        } else {
            // If range is large, show monthly
            for ($date = clone $startDate; $date <= $endDate; $date->addMonth()) {
                $monthStart = clone $date->startOfMonth();
                $monthEnd = clone $date->endOfMonth();

                // Adjust to range
                if ($monthStart < $startDate) $monthStart = clone $startDate;
                if ($monthEnd > $endDate) $monthEnd = clone $endDate;

                $count = Attendance::whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                                  ->where('type', 'check_in')
                                  ->count();
                $chartData->push([
                    'date' => $date->format('M Y'),
                    'count' => $count,
                ]);
            }
        }

        return $chartData;
    }

    public function getAllDashboardData($startDate = null, $endDate = null)
    {
        return [
            'stats' => $this->getDashboardStats($startDate, $endDate),
            'todayAttendances' => $this->getTodayAttendances($startDate, $endDate),
            'mostActiveAslabs' => $this->getMostActiveAslabs($startDate, $endDate),
            'weeklyChartData' => $this->getWeeklyChartData($startDate, $endDate),
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
