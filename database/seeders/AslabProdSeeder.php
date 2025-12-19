<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AslabProdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aslabs = [
            [
                'name' => 'Muhammad Dzaki Aldi',
                'email' => 'aldi@aslab.com',
                'password' => Hash::make('aldi12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 5,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Muhammad Reffa Al Pratama',
                'email' => 'reffa@aslab.com',
                'password' => Hash::make('reffa12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 5,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Muhammad Arifin',
                'email' => 'arifin@aslab.com',
                'password' => Hash::make('arifin12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 5,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Dzikri Maulana',
                'email' => 'dzikri@aslab.com',
                'password' => Hash::make('dzikri12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 7,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Azzelya Rosya Denovya',
                'email' => 'azzel@aslab.com',
                'password' => Hash::make('azzel12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 5,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Ahmad Zulkarnaen',
                'email' => 'zul@aslab.com',
                'password' => Hash::make('zul12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 5,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Brandon Hanif Lastomo',
                'email' => 'brandon@aslab.com',
                'password' => Hash::make('brandon12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 5,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Surya Kamal',
                'email' => 'kamal@aslab.com',
                'password' => Hash::make('kamal12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 5,
                'role' => 'aslab',
                'is_active' => true,
            ],
        ];

        foreach ($aslabs as $aslab) {
            User::create($aslab);
        }
    }
}
