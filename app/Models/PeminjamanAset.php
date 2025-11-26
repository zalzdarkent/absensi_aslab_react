<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PeminjamanAset extends Model
{
    protected $table = 'peminjaman_aset';
    protected $fillable = [
        'aset_id',
        'bahan_id',
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
        'target_return_date',
        'manual_borrower_name',
        'manual_borrower_phone',
        'manual_borrower_class'
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

    // Relasi ke Bahan (many to one)
    public function bahan()
    {
        return $this->belongsTo(Bahan::class, 'bahan_id');
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

    // Helper untuk mendapatkan nama item (aset atau bahan)
    public function getItemNameAttribute()
    {
        if ($this->aset_id && $this->asetAslab) {
            return $this->asetAslab->nama_aset;
        }
        if ($this->bahan_id && $this->bahan) {
            return $this->bahan->nama;
        }
        return 'Unknown Item';
    }

    // Helper untuk mendapatkan kode item (aset atau bahan)
    public function getItemCodeAttribute()
    {
        if ($this->aset_id && $this->asetAslab) {
            return $this->asetAslab->kode_aset;
        }
        if ($this->bahan_id && $this->bahan) {
            return $this->bahan->kode;
        }
        return 'N/A';
    }

    // Helper untuk mendapatkan tipe item
    public function getItemTypeAttribute()
    {
        if ($this->aset_id) {
            return 'aset';
        }
        if ($this->bahan_id) {
            return 'bahan';
        }
        return 'unknown';
    }
}
