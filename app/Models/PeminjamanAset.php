<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PeminjamanAset extends Model
{
    protected $table = 'peminjaman_aset';
    protected $fillable = [
        'aset_id',
        'user_id',
        'stok',
        'tanggal_pinjam',
        'tanggal_kembali',
        'status',
        'approved_by',
        'approved_at',
        'approval_note',
        'keterangan',
        'agreement_accepted',
        'target_return_date'
    ];

    protected $casts = [
        'tanggal_pinjam' => 'date',
        'tanggal_kembali' => 'date',
        'target_return_date' => 'date',
        'approved_at' => 'datetime',
        'agreement_accepted' => 'boolean'
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_BORROWED = 'borrowed';
    const STATUS_RETURNED = 'returned';

    // Relasi ke AsetAslab (many to one)
    public function asetAslab()
    {
        return $this->belongsTo(AsetAslab::class, 'aset_id');
    }

    // Relasi ke User (many to one)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi ke User yang approve (many to one)
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeBorrowed($query)
    {
        return $query->where('status', self::STATUS_BORROWED);
    }

    public function scopeReturned($query)
    {
        return $query->where('status', self::STATUS_RETURNED);
    }

    // Helpers
    public function getStatusTextAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Menunggu Persetujuan',
            self::STATUS_APPROVED => 'Disetujui',
            self::STATUS_REJECTED => 'Ditolak',
            self::STATUS_BORROWED => 'Sedang Dipinjam',
            self::STATUS_RETURNED => 'Dikembalikan',
            default => 'Unknown'
        };
    }
}
