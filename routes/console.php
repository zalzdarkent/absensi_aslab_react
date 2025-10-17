<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\SendPiketReminders;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule untuk reminder telegram otomatis
Schedule::job(new SendPiketReminders('morning'))
    ->dailyAt('07:00')
    ->timezone('Asia/Jakarta')
    ->name('piket-reminder-morning')
    ->description('Send morning piket reminders to aslabs');

Schedule::job(new SendPiketReminders('evening'))
    ->dailyAt('19:00')
    ->timezone('Asia/Jakarta')
    ->name('piket-reminder-evening')
    ->description('Send evening piket reminders to aslabs');

// Test command untuk manual testing
Artisan::command('telegram:test-reminder {type=morning}', function () {
    $type = $this->argument('type');

    $this->info("Testing {$type} piket reminder...");

    dispatch(new SendPiketReminders($type));

    $this->info("✅ Reminder job dispatched! Check logs for details.");
})->purpose('Test telegram piket reminder (morning/evening)');
