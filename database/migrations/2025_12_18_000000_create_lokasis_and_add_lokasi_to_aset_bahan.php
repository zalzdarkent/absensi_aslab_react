<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('lokasis')) {
            Schema::create('lokasis', function (Blueprint $table) {
                $table->id();
                $table->string('nama_lokasi')->unique();
                $table->timestamps();
            });
        }

        // aset_aslabs: tambah kolom lokasi_id TANPA FK, boleh null
        if (Schema::hasTable('aset_aslabs') && !Schema::hasColumn('aset_aslabs', 'lokasi_id')) {
            Schema::table('aset_aslabs', function (Blueprint $table) {
                $table->unsignedBigInteger('lokasi_id')
                    ->nullable()
                    ->after('jenis_id');
            });
        }

        // bahan: tambah kolom lokasi_id TANPA FK, boleh null
        if (Schema::hasTable('bahan') && !Schema::hasColumn('bahan', 'lokasi_id')) {
            Schema::table('bahan', function (Blueprint $table) {
                $table->unsignedBigInteger('lokasi_id')
                    ->nullable()
                    ->after('nama');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('aset_aslabs') && Schema::hasColumn('aset_aslabs', 'lokasi_id')) {
            Schema::table('aset_aslabs', function (Blueprint $table) {
                $table->dropColumn('lokasi_id');
            });
        }

        if (Schema::hasTable('bahan') && Schema::hasColumn('bahan', 'lokasi_id')) {
            Schema::table('bahan', function (Blueprint $table) {
                $table->dropColumn('lokasi_id');
            });
        }

        if (Schema::hasTable('lokasis')) {
            Schema::drop('lokasis');
        }
    }
};