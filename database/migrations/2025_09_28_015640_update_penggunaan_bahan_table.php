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
        Schema::table('penggunaan_bahan', function (Blueprint $table) {
            // Rename column stok to jumlah_digunakan for clarity
            $table->renameColumn('stok', 'jumlah_digunakan');

            // Add new columns
            $table->string('keperluan')->nullable()->after('jumlah_digunakan');
            $table->text('catatan')->nullable()->after('keperluan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penggunaan_bahan', function (Blueprint $table) {
            // Remove added columns
            $table->dropColumn(['keperluan', 'catatan']);

            // Rename column back
            $table->renameColumn('jumlah_digunakan', 'stok');
        });
    }
};
