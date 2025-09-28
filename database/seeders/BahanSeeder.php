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

        // Base material names for generating variations
        $baseMaterials = [
            'Resistor', 'Capacitor', 'LED', 'Transistor', 'IC', 'Diode', 'Inductor', 'Relay',
            'Switch', 'Potentiometer', 'Sensor', 'Crystal', 'Fuse', 'Connector', 'Socket',
            'Header Pin', 'Jumper Wire', 'Breadboard', 'PCB', 'Heat Sink', 'Screw', 'Nut',
            'Bolt', 'Washer', 'Spring', 'Cable', 'Wire', 'Solder', 'Flux', 'Paste',
            'Adhesive', 'Tape', 'Tube', 'Sheet', 'Rod', 'Bar', 'Plate', 'Film',
            'Paper', 'Cloth', 'Foam', 'Rubber', 'Plastic', 'Metal', 'Glass', 'Ceramic',
            'Battery', 'Cell', 'Charger', 'Adapter', 'Converter', 'Regulator', 'Filter'
        ];

        $specifications = [
            // Electronic values
            '1K', '2.2K', '4.7K', '10K', '22K', '47K', '100K', '220K', '470K', '1M',
            '1uF', '10uF', '100uF', '220uF', '470uF', '1000uF', '2200uF',
            '3mm', '5mm', '8mm', '10mm', '12mm', '15mm', '20mm', '25mm',
            '0.5W', '1W', '2W', '5W', '10W', '25W', '50W',
            '3.3V', '5V', '9V', '12V', '24V', '48V', '110V', '220V',
            '1A', '2A', '5A', '10A', '15A', '20A', '30A',
            // Physical measurements
            '0.5mm', '0.8mm', '1.0mm', '1.5mm', '2.0mm', '2.5mm', '3.0mm',
            '10cm', '15cm', '20cm', '25cm', '30cm', '50cm', '100cm',
            'Small', 'Medium', 'Large', 'XL', 'Mini', 'Micro', 'Nano'
        ];

        $colors = [
            'Merah', 'Hijau', 'Biru', 'Kuning', 'Putih', 'Hitam', 'Orange', 'Ungu',
            'Pink', 'Abu-abu', 'Coklat', 'Emas', 'Silver', 'Transparan', 'Clear'
        ];

        $materials = [
            'Aluminium', 'Tembaga', 'Besi', 'Stainless Steel', 'Plastik', 'Karet',
            'Silikon', 'Keramik', 'Fiberglass', 'Carbon', 'Titanium', 'Nikel'
        ];

        $types = [
            'Elektronika', 'Kimia', 'Logam', 'Plastik', 'ATK', 'Pembersih',
            'Mekanik', 'Optik', 'Magnetic', 'Thermal', 'Acoustic', 'Lainnya'
        ];

        $this->command->info('Generating 1000 material records...');

        for ($i = 0; $i < 1000; $i++) {
            $baseMaterial = $faker->randomElement($baseMaterials);
            $jenisBahan = $faker->randomElement($types);

            // Create varied material names
            $nama = $baseMaterial;

            // Add specifications (70% chance)
            if ($faker->boolean(70)) {
                $spec = $faker->randomElement($specifications);
                $nama .= ' ' . $spec;
            }

            // Add color (30% chance)
            if ($faker->boolean(30)) {
                $color = $faker->randomElement($colors);
                $nama .= ' ' . $color;
            }

            // Add material type (20% chance)
            if ($faker->boolean(20)) {
                $material = $faker->randomElement($materials);
                $nama .= ' ' . $material;
            }

            Bahan::create([
                'nama' => $nama,
                'jenis_bahan' => $jenisBahan,
                'stok' => $faker->numberBetween(0, 1000), // Some might be out of stock
                'catatan' => $faker->optional(0.4)->sentence(8),
                'gambar' => 'materials/default-material.jpg'
            ]);

            // Show progress every 100 records
            if (($i + 1) % 100 == 0) {
                $this->command->info('Created ' . ($i + 1) . ' material records...');
            }
        }

        $this->command->info('Successfully created 1000 material records!');
    }
}
