<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

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
}
