<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
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
}
