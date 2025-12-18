<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lokasi extends Model
{
    protected $fillable = [
        'nama_lokasi',
    ];

    public function asetAslabs()
    {
        return $this->hasMany(AsetAslab::class, 'lokasi_id');
    }

    public function bahans()
    {
        return $this->hasMany(Bahan::class, 'lokasi_id');
    }
}


