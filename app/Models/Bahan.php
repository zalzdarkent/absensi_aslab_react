<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bahan extends Model
{
    protected $table = 'bahan';
    protected $fillable = [
        'nama',
        'jenis_bahan',
        'stok',
        'catatan',
        'gambar'
    ];

    // Relasi ke PenggunaanBahan (one to many)
    public function penggunaanBahans()
    {
        return $this->hasMany(PenggunaanBahan::class, 'bahan_id');
    }
}
