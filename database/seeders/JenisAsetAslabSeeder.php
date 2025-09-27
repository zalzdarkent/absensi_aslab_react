<?php

namespace Database\Seeders;

use App\Models\JenisAsetAslab;
use Illuminate\Database\Seeder;

class JenisAsetAslabSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jenisAset = [
            'Komputer & Laptop',
            'Peralatan Jaringan',
            'Peralatan Audio Visual',
            'Furniture Lab',
            'Peralatan Elektronik',
            'Alat Ukur',
            'Perangkat Keras',
            'Peralatan Keamanan',
            'Peralatan Kantor',
            'Peralatan Maintenance'
        ];

        foreach ($jenisAset as $jenis) {
            JenisAsetAslab::create([
                'nama_jenis_aset' => $jenis
            ]);
        }
    }
}
