<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\AttendanceCreated;
use App\Listeners\SendAttendanceNotification;
use Illuminate\Support\Facades\Gate;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            AttendanceCreated::class,
            SendAttendanceNotification::class
        );

        // Global Permission Fallback
        Gate::before(function (User $user, $permission) {
            if ($user->isAdmin()) return true;

            $effectivePermissions = $user->getEffectivePermissions();
            if ($effectivePermissions->contains($permission)) {
                return true;
            }
        });
    }
}
