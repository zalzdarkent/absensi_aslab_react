<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'kelas',
        'jurusan',
    ];

    public function mataKuliahPraktikums()
    {
        return $this->hasMany(MataKuliahPraktikum::class, 'kelas_id');
    }

    // Accessor untuk display format: "Kelas X - Jurusan"
    public function getDisplayNameAttribute(): string
    {
        return "Kelas {$this->kelas} - {$this->jurusan}";
    }
}
