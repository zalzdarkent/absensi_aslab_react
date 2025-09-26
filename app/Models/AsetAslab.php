<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AsetAslab extends Model
{
    protected $fillable = [
        'nama_aset',
        'jenis_id',
        'kode_aset',
        'nomor_seri',
        'stok',
        'status',
        'catatan',
        'gambar'
    ];

    // Relasi ke JenisAsetAslab (many to one)
    public function jenisAset()
    {
        return $this->belongsTo(JenisAsetAslab::class, 'jenis_id');
    }

    // Relasi ke PeminjamanAset (one to many)
    public function peminjamanAsets()
    {
        return $this->hasMany(PeminjamanAset::class, 'aset_id');
    }

    /**
     * Generate a unique kode_aset with prefix AST- and 3 digit number (e.g. AST-001)
     * It checks existing kode_aset in the database and increments the highest number.
     *
     * @return string
     */
    public static function generateKodeAset(): string
    {
        $prefix = 'AST-';

        // Get the current maximum numeric suffix for kode_aset like AST-%
        $table = (new static)->getTable();

        $max = DB::table($table)
            ->where('kode_aset', 'like', $prefix . '%')
            ->selectRaw('MAX(CAST(SUBSTRING(kode_aset, 5) AS UNSIGNED)) as max_num')
            ->value('max_num');

        $next = ($max ? intval($max) + 1 : 1);

        // Format with leading zeros: 001, 002, ...
        $kode = $prefix . str_pad((string)$next, 3, '0', STR_PAD_LEFT);

        // Ensure uniqueness (very unlikely but safe): increment until unique
        while (static::where('kode_aset', $kode)->exists()) {
            $next++;
            $kode = $prefix . str_pad((string)$next, 3, '0', STR_PAD_LEFT);
        }

        return $kode;
    }
}
