<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DosenPraktikum extends Model
{
    protected $fillable = [
        'nama',
        'nip',
    ];

    /**
     * Mata kuliah yang diampu dosen ini
     */
    public function mataKuliahs()
    {
        return $this->belongsToMany(MataKuliahPraktikum::class, 'dosen_mata_kuliah');
    }

    /**
     * Absensi praktikum dari dosen ini
     */
    public function absensiPraktikums()
    {
        return $this->hasMany(AbsensiPraktikum::class);
    }

    /**
     * Accessor untuk menampilkan dosen dengan mata kuliah
     */
    public function getNamaWithMataKuliahAttribute()
    {
        $mataKuliahs = $this->mataKuliahs->pluck('nama')->join(', ');
        return "{$this->nama} - {$mataKuliahs}";
    }
}
