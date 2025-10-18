<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Events\AttendanceCreated;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'timestamp',
        'date',
        'notes',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'date' => 'date',
    ];

    /**
     * The event map for the model.
     */
    protected $dispatchesEvents = [
        'created' => AttendanceCreated::class,
    ];

    /**
     * Get the user that owns the attendance
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for check-in attendances
     */
    public function scopeCheckIn($query)
    {
        return $query->where('type', 'check_in');
    }

    /**
     * Scope for check-out attendances
     */
    public function scopeCheckOut($query)
    {
        return $query->where('type', 'check_out');
    }

    /**
     * Scope for today's attendances
     */
    public function scopeToday($query)
    {
        return $query->where('date', today());
    }

    /**
     * Scope for specific date
     */
    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }
}
