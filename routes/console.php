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

// Schedule untuk pergantian semester otomatis (Februari dan Agustus)
Schedule::job(new \App\Jobs\UpdateSemestersJob())
    ->yearlyOn(2, 1, '00:00')
    ->timezone('Asia/Jakarta')
    ->name('increment-semester-feb')
    ->description('Increment semesters for students on February 1st (Start of Even Semester)');

Schedule::job(new \App\Jobs\UpdateSemestersJob())
    ->yearlyOn(8, 1, '00:00')
    ->timezone('Asia/Jakarta')
    ->name('increment-semester-aug')
    ->description('Increment semesters for students on August 1st (Start of Odd Semester)');

// Test command untuk manual testing
Artisan::command('telegram:test-reminder {type=morning}', function () {
    $type = $this->argument('type');

    $this->info("Testing {$type} piket reminder...");

    dispatch(new SendPiketReminders($type));

    $this->info("✅ Reminder job dispatched! Check logs for details.");
})->purpose('Test telegram piket reminder (morning/evening)');

// Test command untuk manual increment semester
Artisan::command('semester:increment-test', function () {
    $this->info("Manually dispatching UpdateSemestersJob...");
    dispatch(new \App\Jobs\UpdateSemestersJob());
    $this->info("✅ Job dispatched! Semesters will be incremented in the background.");
})->purpose('Manually trigger semester increment for testing');
