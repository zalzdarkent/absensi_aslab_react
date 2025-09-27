<?php

namespace Database\Seeders;

use App\Models\AsetAslab;
use App\Models\JenisAsetAslab;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class AsetAslabSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // Get all jenis aset
        $jenisAsets = JenisAsetAslab::all();

        if ($jenisAsets->isEmpty()) {
            $this->command->error('Tidak ada data jenis aset. Jalankan JenisAsetAslabSeeder terlebih dahulu.');
            return;
        }

        $assetNames = [
            'Laptop Dell Inspiron', 'Laptop Asus VivoBook', 'Laptop Lenovo ThinkPad', 'Laptop HP Pavilion',
            'PC Desktop Intel i5', 'PC Desktop AMD Ryzen', 'Monitor Samsung 24"', 'Monitor LG 27"',
            'Switch TP-Link 8 Port', 'Router Cisco', 'Access Point Ubiquiti', 'Kabel UTP Cat6',
            'Projector Epson', 'Projector BenQ', 'Speaker Aktif Logitech', 'Microphone Wireless',
            'Webcam Logitech C920', 'Headset Gaming', 'Keyboard Mechanical', 'Mouse Wireless',
            'Meja Lab Kayu', 'Kursi Putar', 'Rak Server', 'Lemari Penyimpanan',
            'UPS APC 1000VA', 'Stabilizer', 'Extension Socket', 'Kabel HDMI',
            'Multimeter Digital', 'Osciloscope', 'Function Generator', 'Power Supply',
            'Hard Disk External 1TB', 'SSD Samsung 500GB', 'RAM DDR4 16GB', 'Processor Intel i7',
            'CCTV Camera Indoor', 'CCTV Camera Outdoor', 'DVR 8 Channel', 'Alarm System',
            'Printer Canon Pixma', 'Scanner Epson', 'Shredder Kertas', 'Laminator A4',
            'Vacuum Cleaner', 'Blower', 'Tool Set Screwdriver', 'Solder Station',
            'Whiteboard Magnetic', 'Flipchart Stand', 'Papan Tulis', 'Penghapus Whiteboard'
        ];

        $statuses = ['baik', 'kurang_baik', 'tidak_baik', 'dipinjam', 'sudah_dikembalikan'];

        for ($i = 0; $i < 50; $i++) {
            $jenisId = $jenisAsets->random()->id;
            $namaAset = $assetNames[$i];

            AsetAslab::create([
                'nama_aset' => $namaAset,
                'jenis_id' => $jenisId,
                'kode_aset' => AsetAslab::generateKodeAset(),
                'nomor_seri' => $faker->optional(0.8)->regexify('[A-Z0-9]{8,12}'),
                'stok' => $faker->numberBetween(1, 20),
                'status' => $faker->randomElement($statuses),
                'catatan' => $faker->optional(0.6)->sentence(10),
                'gambar' => 'assets/default-asset.jpg'
            ]);
        }
    }
}
