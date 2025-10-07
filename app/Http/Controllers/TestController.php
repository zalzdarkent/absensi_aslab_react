<?php

namespace App\Http\Controllers;

use App\Events\AttendanceUpdated;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function testBroadcast(DashboardService $dashboardService)
    {
        try {
            $dashboardData = $dashboardService->getAllDashboardData();

            // Fire the event manually for testing
            AttendanceUpdated::dispatch(
                ['test' => true, 'user' => ['name' => 'Test User']],
                $dashboardData['stats'],
                $dashboardData['todayAttendances'],
                $dashboardData['weeklyChartData']
            );

            return response()->json([
                'success' => true,
                'message' => 'Broadcast event fired successfully',
                'data' => $dashboardData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
