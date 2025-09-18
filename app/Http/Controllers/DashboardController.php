<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        $currentMonth = $request->get('month', now()->month);
        $currentYear = $request->get('year', now()->year);

        // Statistics
        $totalAslabs = User::where('role', 'aslab')->where('is_active', true)->count();
        $todayCheckins = Attendance::where('date', $today)->where('type', 'check_in')->count();
        $todayCheckouts = Attendance::where('date', $today)->where('type', 'check_out')->count();
        $activeToday = $todayCheckins;

        // Today's attendance list
        $todayAttendances = Attendance::with('user')
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

        // Most active aslab this month
        $mostActiveAslabs = User::withCount([
            'attendances' => function ($query) use ($currentMonth, $currentYear) {
                $query->whereMonth('date', $currentMonth)
                      ->whereYear('date', $currentYear);
            }
        ])
            ->where('role', 'aslab')
            ->where('is_active', true)
            ->orderBy('attendances_count', 'desc')
            ->take(10)
            ->get()
            ->map(function ($user) {
                return [
                    'name' => $user->name,
                    'prodi' => $user->prodi,
                    'semester' => $user->semester,
                    'total_attendance' => $user->attendances_count,
                ];
            });

        // Weekly attendance chart data
        $weeklyData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Attendance::where('date', $date)
                              ->where('type', 'check_in')
                              ->count();
            $weeklyData[] = [
                'date' => $date->format('d/m'),
                'count' => $count,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'total_aslabs' => $totalAslabs,
                'today_checkins' => $todayCheckins,
                'today_checkouts' => $todayCheckouts,
                'active_today' => $activeToday,
            ],
            'today_attendances' => $todayAttendances,
            'most_active_aslabs' => $mostActiveAslabs,
            'weekly_chart_data' => $weeklyData,
            'current_date' => $today->format('d F Y'),
        ]);
    }

    public function attendanceHistory(Request $request)
    {
        try {
            $search = $request->get('search');
            $status = $request->get('status');
            $date = $request->get('date');
            $sort = $request->get('sort');
            $direction = $request->get('direction', 'desc');

            // Get unique dates and users for attendance records
            $query = Attendance::with('user')
                ->selectRaw('attendances.user_id, attendances.date, MIN(attendances.timestamp) as check_in_time, MAX(attendances.timestamp) as check_out_time')
                ->when($search, function ($q) use ($search) {
                    $q->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                                  ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->when($date, function ($q) use ($date) {
                    $q->where('attendances.date', $date);
                })
                ->groupBy('attendances.user_id', 'attendances.date');

            // Apply sorting
            if ($sort) {
                switch ($sort) {
                    case 'user':
                        $query->join('users', 'attendances.user_id', '=', 'users.id')
                              ->addSelect('users.name as user_name')
                              ->orderBy('users.name', $direction);
                        break;
                    case 'date':
                        $query->orderBy('attendances.date', $direction);
                        break;
                    case 'check_in':
                        $query->orderBy('check_in_time', $direction);
                        break;
                    case 'check_out':
                        $query->orderBy('check_out_time', $direction);
                        break;
                    default:
                        $query->orderBy('attendances.date', 'desc');
                }
            } else {
                $query->orderBy('attendances.date', 'desc');
            }

            $attendanceRecords = $query->paginate(20);

            // Transform the data to match the expected structure
            $attendanceRecords->getCollection()->transform(function ($record) {
                $user = User::find($record->user_id);
                $checkInRecord = Attendance::where('user_id', $record->user_id)
                    ->where('date', $record->date)
                    ->where('type', 'check_in')
                    ->first();

                $checkOutRecord = Attendance::where('user_id', $record->user_id)
                    ->where('date', $record->date)
                    ->where('type', 'check_out')
                    ->first();

                // Determine status
                $status = 'present'; // Default
                if ($checkInRecord && $checkInRecord->timestamp->format('H:i') > '08:30') {
                    $status = 'late';
                }
                if (!$checkInRecord) {
                    $status = 'absent';
                }

                return [
                    'id' => $record->user_id . '_' . $record->date,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'date' => $record->date,
                    'check_in' => $checkInRecord ? $checkInRecord->timestamp->toISOString() : null,
                    'check_out' => $checkOutRecord ? $checkOutRecord->timestamp->toISOString() : null,
                    'status' => $status,
                    'notes' => $checkInRecord ? $checkInRecord->notes : null,
                ];
            });

            // Filter by status if provided
            if ($status) {
                $filteredData = $attendanceRecords->getCollection()->filter(function ($record) use ($status) {
                    return $record['status'] === $status;
                });
                $attendanceRecords->setCollection($filteredData);
            }

            return Inertia::render('attendance-history', [
                'attendances' => $attendanceRecords,
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'date' => $date,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('DashboardController@attendanceHistory error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
