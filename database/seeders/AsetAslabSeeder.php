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

        // Base asset names for generating variations
        $baseAssetNames = [
            'Laptop', 'Desktop PC', 'Monitor', 'Keyboard', 'Mouse', 'Printer', 'Scanner', 'Projector',
            'Speaker', 'Headset', 'Webcam', 'Microphone', 'Router', 'Switch', 'Access Point',
            'UPS', 'Stabilizer', 'Hard Disk', 'SSD', 'RAM', 'Processor', 'Motherboard',
            'VGA Card', 'Power Supply', 'Case PC', 'Cooling Fan', 'CCTV Camera', 'DVR',
            'Alarm System', 'Fire Extinguisher', 'Multimeter', 'Osciloscope', 'Function Generator',
            'Soldering Station', 'Hot Air Gun', 'Power Drill', 'Screwdriver Set', 'Pliers',
            'Wire Stripper', 'Digital Caliper', 'Meja Kerja', 'Kursi Lab', 'Lemari', 'Rak',
            'Whiteboard', 'Flipchart', 'Extension Cable', 'Network Cable', 'HDMI Cable',
            'USB Cable', 'Power Cable', 'Adapter', 'Converter', 'Hub USB'
        ];

        $brands = [
            'Dell', 'HP', 'Asus', 'Lenovo', 'Acer', 'Samsung', 'LG', 'Sony', 'Canon', 'Epson',
            'Logitech', 'Razer', 'Corsair', 'TP-Link', 'D-Link', 'Cisco', 'Ubiquiti', 'APC',
            'Schneider', 'Western Digital', 'Seagate', 'Kingston', 'Corsair', 'G.Skill',
            'Intel', 'AMD', 'NVIDIA', 'MSI', 'Gigabyte', 'ASUS ROG', 'Cooler Master',
            'Thermaltake', 'Seasonic', 'Antec', 'Fluke', 'Keysight', 'Rigol', 'Hakko',
            'Weller', 'Bosch', 'Makita', 'DeWalt', 'Stanley', 'Mitutoyo', 'IKEA', 'Olympic'
        ];

        $models = [
            'Pro', 'Ultra', 'Max', 'Elite', 'Premium', 'Standard', 'Basic', 'Advanced',
            'Professional', 'Enterprise', 'Home', 'Office', 'Gaming', 'Creator', 'Business',
            'V1', 'V2', 'V3', 'Gen1', 'Gen2', 'Gen3', 'Series A', 'Series B', 'Series X',
            'Plus', 'Lite', 'Mini', 'Compact', 'Full Size', 'Wireless', 'Bluetooth', 'USB'
        ];

        $statuses = ['baik', 'kurang_baik', 'tidak_baik'];

        $this->command->info('Generating 1000 asset records...');

        for ($i = 0; $i < 1000; $i++) {
            $jenisId = $jenisAsets->random()->id;
            $baseName = $faker->randomElement($baseAssetNames);
            $brand = $faker->randomElement($brands);
            $model = $faker->randomElement($models);

            // Create varied asset names
            $namaAset = $brand . ' ' . $baseName . ' ' . $model;

            // Add some variation with numbers/specifications
            if ($faker->boolean(30)) {
                $specs = $faker->randomElement([
                    '24"', '27"', '32"', '1TB', '2TB', '500GB', '16GB', '32GB', '8GB',
                    '1000VA', '1500VA', '2000VA', 'i3', 'i5', 'i7', 'i9', 'Ryzen 5', 'Ryzen 7'
                ]);
                $namaAset .= ' ' . $specs;
            }

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

            // Show progress every 100 records
            if (($i + 1) % 100 == 0) {
                $this->command->info('Created ' . ($i + 1) . ' asset records...');
            }
        }

        $this->command->info('Successfully created 1000 asset records!');
    }
}
