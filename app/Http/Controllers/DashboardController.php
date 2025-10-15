<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request)
    {
        $dashboardData = $this->dashboardService->getAllDashboardData();

        return Inertia::render('dashboard', [
            'stats' => $dashboardData['stats'],
            'today_attendances' => $dashboardData['todayAttendances'],
            'most_active_aslabs' => $dashboardData['mostActiveAslabs'],
            'weekly_chart_data' => $dashboardData['weeklyChartData'],
            'current_date' => now()->format('d F Y'),
        ]);
    }

    public function attendanceToday()
    {
        $todayAttendances = $this->dashboardService->getTodayAttendances();

        return response()->json([
            'success' => true,
            'data' => $todayAttendances
        ]);
    }

    public function getDayDetail(Request $request)
    {
        $date = $request->query('date');

        if (!$date) {
            return response()->json([
                'error' => 'Date parameter is required'
            ], 400);
        }

        try {
            $dayDetailData = $this->dashboardService->getDayDetail($date);

            return response()->json([
                'success' => true,
                'date' => $date,
                'attendances' => $dayDetailData,
                'total' => count($dayDetailData),
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard getDayDetail error: ' . $e->getMessage());

            return response()->json([
                'error' => 'An error occurred while fetching day detail data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function dayDetail(Request $request)
    {
        $date = $request->query('date');

        if (!$date) {
            return redirect()->route('dashboard')->with('error', 'Date parameter is required');
        }

        try {
            $dayDetailData = $this->dashboardService->getDayDetail($date);

            return Inertia::render('day-detail', [
                'date' => $date,
                'attendances' => $dayDetailData,
                'total' => count($dayDetailData),
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard dayDetail error: ' . $e->getMessage());

            return redirect()->route('dashboard')->with('error', 'Terjadi kesalahan saat mengambil data detail hari');
        }
    }

    public function dayDetailData(Request $request)
    {
        $date = $request->query('date');

        if (!$date) {
            return response()->json([
                'error' => 'Date parameter is required'
            ], 400);
        }

        try {
            $dayDetailData = $this->dashboardService->getDayDetail($date);

            // Return JSON untuk AJAX request
            return response()->json([
                'success' => true,
                'date' => $date,
                'attendances' => $dayDetailData,
                'total' => count($dayDetailData),
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard dayDetailData error: ' . $e->getMessage());

            return response()->json([
                'error' => 'Terjadi kesalahan saat mengambil data detail hari',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
