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
        // Change peminjaman_aset table columns
        Schema::table('peminjaman_aset', function (Blueprint $table) {
            $table->dateTime('tanggal_pinjam')->change();
            $table->dateTime('tanggal_kembali')->nullable()->change();
            $table->dateTime('target_return_date')->nullable()->change();
        });

        // Change penggunaan_bahan table column
        Schema::table('penggunaan_bahan', function (Blueprint $table) {
            $table->dateTime('tanggal_penggunaan')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert peminjaman_aset table columns
        Schema::table('peminjaman_aset', function (Blueprint $table) {
            $table->date('tanggal_pinjam')->change();
            $table->date('tanggal_kembali')->nullable()->change();
            $table->date('target_return_date')->nullable()->change();
        });

        // Revert penggunaan_bahan table column
        Schema::table('penggunaan_bahan', function (Blueprint $table) {
            $table->date('tanggal_penggunaan')->change();
        });
    }
};
