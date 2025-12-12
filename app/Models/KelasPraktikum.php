<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KelasPraktikum extends Model
{
    protected $fillable = [
        'nama_kelas',
    ];

    /**
     * Absensi praktikum untuk kelas ini
     */
    public function absensiPraktikums()
    {
        return $this->hasMany(AbsensiPraktikum::class);
    }
}
