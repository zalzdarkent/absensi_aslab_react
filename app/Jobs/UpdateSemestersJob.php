<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class UpdateSemestersJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $count = \App\Models\User::whereIn('role', ['aslab', 'mahasiswa'])
            ->whereNotNull('semester')
            ->increment('semester');

        \Illuminate\Support\Facades\Log::info("Successfully incremented semester for {$count} users (aslab and mahasiswa).");
    }
}
