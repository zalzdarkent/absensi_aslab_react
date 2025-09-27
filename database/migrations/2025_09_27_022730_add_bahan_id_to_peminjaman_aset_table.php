<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('peminjaman_aset', function (Blueprint $table) {
            // Tambah kolom bahan_id (nullable) untuk mendukung peminjaman bahan
            $table->foreignId('bahan_id')->nullable()->constrained('bahan')->onDelete('cascade')->after('aset_id');

            // Ubah aset_id menjadi nullable agar bisa menampung peminjaman bahan
            $table->foreignId('aset_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peminjaman_aset', function (Blueprint $table) {
            // Hapus kolom bahan_id
            $table->dropForeign(['bahan_id']);
            $table->dropColumn('bahan_id');

            // Kembalikan aset_id menjadi not nullable
            $table->foreignId('aset_id')->nullable(false)->change();
        });
    }
};
