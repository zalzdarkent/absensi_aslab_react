<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aslabs = User::where('role', 'aslab')->where('is_active', true)->get();

        // Generate attendance data for the last 30 days
        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            // Only generate data for weekdays (Mon-Fri)
            if ($date->isWeekend()) {
                continue;
            }

            // Randomly select 60-80% of aslabs to have attendance on this day
            $activeAslabs = $aslabs->random(rand(3, 4));

            foreach ($activeAslabs as $aslab) {
                // Generate check-in time between 08:00 - 10:00
                $checkInTime = $date->copy()->setTime(
                    rand(8, 9), // hour
                    rand(0, 59), // minute
                    rand(0, 59)  // second
                );

                // Create check-in attendance
                Attendance::create([
                    'user_id' => $aslab->id,
                    'type' => 'check_in',
                    'timestamp' => $checkInTime,
                    'date' => $date->toDateString(),
                    'notes' => 'Check-in via RFID',
                ]);

                // 80% chance to have check-out
                if (rand(1, 10) <= 8) {
                    // Generate check-out time between 15:00 - 18:00
                    $checkOutTime = $date->copy()->setTime(
                        rand(15, 17), // hour
                        rand(0, 59),  // minute
                        rand(0, 59)   // second
                    );

                    // Create check-out attendance
                    Attendance::create([
                        'user_id' => $aslab->id,
                        'type' => 'check_out',
                        'timestamp' => $checkOutTime,
                        'date' => $date->toDateString(),
                        'notes' => 'Check-out via RFID',
                    ]);
                }
            }
        }

        // Generate some additional data for previous months
        for ($month = 1; $month <= 7; $month++) {
            for ($day = 1; $day <= 25; $day += 2) {
                $date = Carbon::createFromDate(2025, $month, $day);

                if ($date->isWeekend() || $date->isFuture()) {
                    continue;
                }

                $activeAslabs = $aslabs->random(rand(2, 4));

                foreach ($activeAslabs as $aslab) {
                    $checkInTime = $date->copy()->setTime(rand(8, 9), rand(0, 59), rand(0, 59));

                    Attendance::create([
                        'user_id' => $aslab->id,
                        'type' => 'check_in',
                        'timestamp' => $checkInTime,
                        'date' => $date->toDateString(),
                        'notes' => 'Check-in via RFID',
                    ]);

                    if (rand(1, 10) <= 7) {
                        $checkOutTime = $date->copy()->setTime(rand(15, 17), rand(0, 59), rand(0, 59));

                        Attendance::create([
                            'user_id' => $aslab->id,
                            'type' => 'check_out',
                            'timestamp' => $checkOutTime,
                            'date' => $date->toDateString(),
                            'notes' => 'Check-out via RFID',
                        ]);
                    }
                }
            }
        }
    }
}
