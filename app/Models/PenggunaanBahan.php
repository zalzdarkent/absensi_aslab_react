<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenggunaanBahan extends Model
{
    protected $table = 'penggunaan_bahan';

    protected $fillable = [
        'bahan_id',
        'user_id',
        'tanggal_penggunaan',
        'jumlah_digunakan',
        'keperluan',
        'catatan',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'tanggal_penggunaan' => 'datetime',
        'approved_at' => 'datetime'
    ];

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
}
