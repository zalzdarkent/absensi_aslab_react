<?php

namespace Database\Seeders;

use App\Models\Bahan;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class BahanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        $bahanData = [
            // Bahan Elektronika
            ['nama' => 'Resistor 1K Ohm', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'Resistor 10K Ohm', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'Resistor 100K Ohm', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'Capacitor 100uF', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'Capacitor 1000uF', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'LED Merah 5mm', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'LED Hijau 5mm', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'LED Biru 5mm', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'Transistor NPN 2N2222', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'Transistor PNP BC557', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'IC 555 Timer', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'IC Op-Amp LM358', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'Diode 1N4007', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'Breadboard 400 Point', 'jenis_bahan' => 'Elektronika'],
            ['nama' => 'Jumper Wire Male-Male', 'jenis_bahan' => 'Elektronika'],

            // Bahan Kimia Lab
            ['nama' => 'Alkohol 70%', 'jenis_bahan' => 'Kimia'],
            ['nama' => 'Aseton', 'jenis_bahan' => 'Kimia'],
            ['nama' => 'Flux Solder', 'jenis_bahan' => 'Kimia'],
            ['nama' => 'Thinner', 'jenis_bahan' => 'Kimia'],
            ['nama' => 'Contact Cleaner', 'jenis_bahan' => 'Kimia'],

            // Bahan Logam
            ['nama' => 'Timah Solder 0.8mm', 'jenis_bahan' => 'Logam'],
            ['nama' => 'Timah Solder 1.0mm', 'jenis_bahan' => 'Logam'],
            ['nama' => 'Kawat Tembaga 0.5mm', 'jenis_bahan' => 'Logam'],
            ['nama' => 'Kawat Tembaga 1.0mm', 'jenis_bahan' => 'Logam'],
            ['nama' => 'Plat PCB Lubang', 'jenis_bahan' => 'Logam'],

            // Bahan Plastik
            ['nama' => 'Heat Shrink 2mm', 'jenis_bahan' => 'Plastik'],
            ['nama' => 'Heat Shrink 5mm', 'jenis_bahan' => 'Plastik'],
            ['nama' => 'Cable Tie 15cm', 'jenis_bahan' => 'Plastik'],
            ['nama' => 'Cable Tie 25cm', 'jenis_bahan' => 'Plastik'],
            ['nama' => 'Box Plastik Kecil', 'jenis_bahan' => 'Plastik'],

            // Bahan Kertas & ATK
            ['nama' => 'Kertas A4 80gsm', 'jenis_bahan' => 'ATK'],
            ['nama' => 'Kertas Label', 'jenis_bahan' => 'ATK'],
            ['nama' => 'Double Tape', 'jenis_bahan' => 'ATK'],
            ['nama' => 'Isolasi Listrik', 'jenis_bahan' => 'ATK'],
            ['nama' => 'Spidol Permanen', 'jenis_bahan' => 'ATK'],

            // Bahan Pembersih
            ['nama' => 'Tissue Pembersih', 'jenis_bahan' => 'Pembersih'],
            ['nama' => 'Cotton Bud', 'jenis_bahan' => 'Pembersih'],
            ['nama' => 'Sikat Kecil', 'jenis_bahan' => 'Pembersih'],
            ['nama' => 'Kain Lap Microfiber', 'jenis_bahan' => 'Pembersih'],
            ['nama' => 'Vacuum Oil', 'jenis_bahan' => 'Pembersih'],

            // Bahan Lainnya
            ['nama' => 'Baterai AA Alkaline', 'jenis_bahan' => 'Lainnya'],
            ['nama' => 'Baterai 9V', 'jenis_bahan' => 'Lainnya'],
            ['nama' => 'Fuse 1A', 'jenis_bahan' => 'Lainnya'],
            ['nama' => 'Fuse 5A', 'jenis_bahan' => 'Lainnya'],
            ['nama' => 'Switch Push Button', 'jenis_bahan' => 'Lainnya'],
            ['nama' => 'Potentiometer 10K', 'jenis_bahan' => 'Lainnya'],
            ['nama' => 'Relay 12V', 'jenis_bahan' => 'Lainnya'],
            ['nama' => 'Connector Terminal', 'jenis_bahan' => 'Lainnya'],
            ['nama' => 'Kabel Serabut Merah', 'jenis_bahan' => 'Lainnya'],
            ['nama' => 'Kabel Serabut Hitam', 'jenis_bahan' => 'Lainnya']
        ];

        foreach ($bahanData as $index => $bahan) {
            Bahan::create([
                'nama' => $bahan['nama'],
                'jenis_bahan' => $bahan['jenis_bahan'],
                'stok' => $faker->numberBetween(10, 500),
                'catatan' => $faker->optional(0.5)->sentence(8),
                'gambar' => 'materials/default-material.jpg'
            ]);
        }
    }
}
