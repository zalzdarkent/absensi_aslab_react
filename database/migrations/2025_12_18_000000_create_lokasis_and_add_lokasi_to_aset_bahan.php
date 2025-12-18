<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Buat tabel lokasis hanya jika belum ada
        if (!Schema::hasTable('lokasis')) {
            Schema::create('lokasis', function (Blueprint $table) {
                $table->id();
                $table->string('nama_lokasi')->unique();
                $table->timestamps();
            });
        }

        // Tambah kolom lokasi_id ke aset_aslabs jika belum ada
        if (Schema::hasTable('aset_aslabs') && !Schema::hasColumn('aset_aslabs', 'lokasi_id')) {
            Schema::table('aset_aslabs', function (Blueprint $table) {
                $table->foreignId('lokasi_id')
                    ->after('jenis_id')
                    ->constrained('lokasis')
                    ->onDelete('restrict');
            });
        }

        // Tambah kolom lokasi_id ke bahan jika belum ada
        if (Schema::hasTable('bahan') && !Schema::hasColumn('bahan', 'lokasi_id')) {
            Schema::table('bahan', function (Blueprint $table) {
                $table->foreignId('lokasi_id')
                    ->after('nama')
                    ->constrained('lokasis')
                    ->onDelete('restrict');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('aset_aslabs') && Schema::hasColumn('aset_aslabs', 'lokasi_id')) {
            Schema::table('aset_aslabs', function (Blueprint $table) {
                $table->dropForeign(['lokasi_id']);
                $table->dropColumn('lokasi_id');
            });
        }

        if (Schema::hasTable('bahan') && Schema::hasColumn('bahan', 'lokasi_id')) {
            Schema::table('bahan', function (Blueprint $table) {
                $table->dropForeign(['lokasi_id']);
                $table->dropColumn('lokasi_id');
            });
        }

        if (Schema::hasTable('lokasis')) {
            Schema::drop('lokasis');
        }
    }
};