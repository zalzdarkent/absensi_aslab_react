<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

use App\Models\Attendance;
use App\Models\PeminjamanAset;
use App\Models\PenggunaanBahan;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    public const ROLE_DEFAULTS = [
        'aslab' => [
            'view_dashboard', 'view_attendance', 'view_attendance_history',
            'view_picket_schedule', 'view_assets', 'manage_assets',
            'view_loans', 'approve_loans',
        ],
        'mahasiswa' => [
            'view_dashboard', 'view_picket_schedule', 'view_loans',
        ],
        'dosen' => [
            'view_dashboard', 'view_attendance_history',
        ],
    ];

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'rfid_code',
        'prodi',
        'semester',
        'role',
        'is_active',
        'piket_day',
        'telegram_chat_id',
        'telegram_notifications',
        'google_id',
        'github_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'semester' => 'integer',
            'telegram_notifications' => 'boolean',
        ];
    }

    /**
     * Get attendances for this user
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get today's check-in attendance
     */
    public function todayCheckIn()
    {
        return $this->attendances()
            ->where('date', today())
            ->where('type', 'check_in')
            ->first();
    }

    /**
     * Get today's check-out attendance
     */
    public function todayCheckOut()
    {
        return $this->attendances()
            ->where('date', today())
            ->where('type', 'check_out')
            ->first();
    }

    /**
     * Check if user has checked in today
     */
    public function hasCheckedInToday()
    {
        return $this->todayCheckIn() !== null;
    }

    /**
     * Check if user has checked out today
     */
    public function hasCheckedOutToday()
    {
        return $this->todayCheckOut() !== null;
    }

    /**
     * Get peminjaman asets for this user
     */
    public function peminjamanAsets()
    {
        return $this->hasMany(PeminjamanAset::class);
    }

    /**
     * Get penggunaan bahans for this user
     */
    public function penggunaanBahans()
    {
        return $this->hasMany(PenggunaanBahan::class);
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is aslab
     */
    public function isAslab(): bool
    {
        return $this->hasRole('aslab');
    }

    /**
     * Check if user is mahasiswa
     */
    public function isMahasiswa(): bool
    {
        return $this->hasRole('mahasiswa');
    }

    /**
     * Check if user is dosen
     */
    public function isDosen(): bool
    {
        return $this->hasRole('dosen');
    }

    /**
     * Check if user can access admin features
     */
    public function canAccessAdmin(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Check if user can access management features (Admin & Aslab)
     */
    public function canAccessManagement(): bool
    {
        return $this->hasAnyRole(['admin', 'aslab']);
    }

    /**
     * Check if user can access attendance features (Admin & Aslab)
     */
    public function canAccessAttendance(): bool
    {
        return $this->hasAnyRole(['admin', 'aslab']);
    }

    /**
     * Check if user can access peminjaman features (All users)
     */
    public function canAccessPeminjaman(): bool
    {
        return $this->hasAnyRole(['admin', 'aslab', 'mahasiswa', 'dosen']);
    }

    /**
     * Check if user has telegram connected
     */
    public function hasTelegramConnected(): bool
    {
        return !empty($this->telegram_chat_id);
    }

    /**
     * Get effective permissions (database + fallback if empty)
     */
    public function getEffectivePermissions()
    {
        if ($this->isAdmin()) {
            return \Spatie\Permission\Models\Permission::all()->pluck('name');
        }

        $directPermissions = $this->getAllPermissions()->pluck('name');

        if ($directPermissions->isNotEmpty()) {
            return $directPermissions;
        }

        // Fallback to hardcoded defaults if no permissions assigned in DB
        return collect(self::ROLE_DEFAULTS[$this->role] ?? []);
    }

    /**
     * Check if user has telegram notifications enabled
     */
    public function isTelegramNotificationsEnabled(): bool
    {
        return $this->telegram_notifications && $this->hasTelegramConnected();
    }
}
