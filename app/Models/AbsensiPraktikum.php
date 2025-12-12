<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbsensiPraktikum extends Model
{
    protected $fillable = [
        'aslab_id',
        'tanggal',
        'dosen_praktikum_id',
        'pertemuan',
        'sebagai',
        'kehadiran_dosen',
        'kelas_praktikum_id',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    const SEBAGAI_INSTRUKTUR = 'instruktur';
    const SEBAGAI_ASISTEN = 'asisten';

    const KEHADIRAN_HADIR = 'hadir';
    const KEHADIRAN_TIDAK_HADIR = 'tidak_hadir';

    /**
     * Aslab yang melakukan absensi
     */
    public function aslab()
    {
        return $this->belongsTo(User::class, 'aslab_id');
    }

    /**
     * Dosen praktikum
     */
    public function dosenPraktikum()
    {
        return $this->belongsTo(DosenPraktikum::class);
    }

    /**
     * Kelas praktikum
     */
    public function kelasPraktikum()
    {
        return $this->belongsTo(KelasPraktikum::class);
    }

    /**
     * Accessor untuk status kehadiran dosen
     */
    public function getKehadiranDosenTextAttribute()
    {
        return match($this->kehadiran_dosen) {
            self::KEHADIRAN_HADIR => 'Hadir',
            self::KEHADIRAN_TIDAK_HADIR => 'Tidak Hadir',
            default => 'Unknown'
        };
    }

    /**
     * Accessor untuk sebagai text
     */
    public function getSebagaiTextAttribute()
    {
        return match($this->sebagai) {
            self::SEBAGAI_INSTRUKTUR => 'Instruktur',
            self::SEBAGAI_ASISTEN => 'Asisten',
            default => 'Unknown'
        };
    }
}
