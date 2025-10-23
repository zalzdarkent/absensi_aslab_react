<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Checking failed jobs...\n";

$failedJobs = DB::table('failed_jobs')->orderBy('failed_at', 'desc')->limit(1)->get();

if ($failedJobs->count() == 0) {
    echo "No failed jobs found.\n";
} else {
    foreach ($failedJobs as $job) {
        echo "Failed at: " . $job->failed_at . "\n";
        echo "Queue: " . $job->queue . "\n";
        echo "Connection: " . $job->connection . "\n";
        echo "\nException:\n" . $job->exception . "\n";
        echo "\nPayload:\n" . $job->payload . "\n";
    }
}
