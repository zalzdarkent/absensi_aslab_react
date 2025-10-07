<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AttendanceUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $attendanceData;
    public $stats;
    public $todayAttendances;
    public $weeklyChartData;

    /**
     * Create a new event instance.
     */
    public function __construct($attendance, $stats, $todayAttendances, $weeklyChartData)
    {
        Log::info('AttendanceUpdated event constructor called', [
            'attendance_id' => $attendance->id ?? 'null',
            'stats_count' => count($stats ?? []),
            'attendances_count' => count($todayAttendances ?? [])
        ]);

        // Convert model to array to avoid serialization issues
        $this->attendanceData = [
            'id' => $attendance->id,
            'user_id' => $attendance->user_id,
            'type' => $attendance->type,
            'timestamp' => $attendance->timestamp,
            'date' => $attendance->date,
            'notes' => $attendance->notes,
            'user' => [
                'id' => $attendance->user->id ?? null,
                'name' => $attendance->user->name ?? null,
                'prodi' => $attendance->user->prodi ?? null,
                'semester' => $attendance->user->semester ?? null,
            ]
        ];

        $this->stats = $stats;
        $this->todayAttendances = $todayAttendances;
        $this->weeklyChartData = $weeklyChartData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        Log::info('AttendanceUpdated broadcastOn called - broadcasting to dashboard channel');

        return [
            new Channel('dashboard'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        Log::info('AttendanceUpdated broadcastAs called - event name: attendance.updated');

        return 'attendance.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        Log::info('AttendanceUpdated broadcastWith called', [
            'attendance_user_id' => $this->attendanceData['user_id'] ?? 'null',
            'stats_present' => $this->stats['present'] ?? 0,
            'attendances_count' => count($this->todayAttendances ?? [])
        ]);

        return [
            'attendance' => $this->attendanceData,
            'stats' => $this->stats,
            'todayAttendances' => $this->todayAttendances,
            'weeklyChartData' => $this->weeklyChartData,
        ];
    }
}
