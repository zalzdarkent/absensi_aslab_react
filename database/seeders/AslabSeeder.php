<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AslabSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@aslab.local',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        // Create sample aslabs
        $aslabs = [
            [
                'name' => 'Alif Fadillah Ummar',
                'email' => '2210631170004@student.unsika.ac.id',
                'password' => Hash::make('alif12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 7,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Aditya Rizku Darmawan',
                'email' => '2210631170005@student.unsika.ac.id',
                'password' => Hash::make('aditya12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 7,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Bintang Danuarta',
                'email' => '2210631170006@student.unsika.ac.id',
                'password' => Hash::make('bintang12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 7,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Iman Nurwahyu',
                'email' => '2210631170007@student.unsika.ac.id',
                'password' => Hash::make('iman12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 5,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Ikhwan Pratama Hidayat',
                'email' => '2210631170008@student.unsika.ac.id',
                'password' => Hash::make('ikhwan12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 7,
                'role' => 'aslab',
                'is_active' => true,
            ],
            [
                'name' => 'Ari Rizwan',
                'email' => '2210631170009@student.unsika.ac.id',
                'password' => Hash::make('doni12345'),
                'rfid_code' => null, // Will be registered later with actual RFID card
                'prodi' => 'Informatika',
                'semester' => 7,
                'role' => 'aslab',
                'is_active' => true,
                'is_active' => true, // inactive user for testing
            ],
        ];

        foreach ($aslabs as $aslabData) {
            $user = User::create($aslabData);
            $user->assignRole($aslabData['role']);
        }
    }
}
