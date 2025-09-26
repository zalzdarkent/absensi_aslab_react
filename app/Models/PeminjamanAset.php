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
        'persetujuan'
    ];

    protected $casts = [
        'tanggal_pinjam' => 'date',
        'tanggal_kembali' => 'date',
    ];

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
}
