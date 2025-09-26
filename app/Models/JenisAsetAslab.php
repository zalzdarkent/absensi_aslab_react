<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisAsetAslab extends Model
{
    protected $fillable = [
        'nama_jenis_aset'
    ];

    // Relasi ke AsetAslab (one to many)
    public function asetAslabs()
    {
        return $this->hasMany(AsetAslab::class, 'jenis_id');
    }
}
