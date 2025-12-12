<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MataKuliahPraktikum extends Model
{
    protected $fillable = [
        'nama',
        'kelas_id',
    ];

    protected $with = ['kelas'];

    /**
     * Kelas untuk mata kuliah ini
     */
    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    /**
     * Dosen yang mengampu mata kuliah ini
     */
    public function dosens()
    {
        return $this->belongsToMany(DosenPraktikum::class, 'dosen_mata_kuliah');
    }

    /**
     * Absensi praktikum untuk mata kuliah ini
     */
    public function absensiPraktikums()
    {
        return $this->hasManyThrough(
            AbsensiPraktikum::class,
            DosenPraktikum::class,
            'id',
            'dosen_praktikum_id'
        );
    }
}
