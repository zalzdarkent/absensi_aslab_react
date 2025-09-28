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
        Schema::table('aset_aslabs', function (Blueprint $table) {
            // Add indexes for search columns
            $table->index(['nama_aset'], 'idx_aset_nama'); // Index for asset name search
            $table->index(['kode_aset'], 'idx_aset_kode'); // Index for asset code search
            $table->index(['stok'], 'idx_aset_stok'); // Index for stock filtering
            $table->index(['status'], 'idx_aset_status'); // Index for status filtering

            // Composite index for common search combinations
            $table->index(['nama_aset', 'stok'], 'idx_aset_nama_stok'); // Name + stock combo
            $table->index(['kode_aset', 'stok'], 'idx_aset_kode_stok'); // Code + stock combo

            // Fulltext index for advanced text search (if using MySQL with fulltext support)
            // $table->fullText(['nama_aset', 'catatan'], 'ft_aset_search'); // Uncomment if using MySQL 5.7+
        });

        Schema::table('bahan', function (Blueprint $table) {
            // Add indexes for search columns
            $table->index(['nama'], 'idx_bahan_nama'); // Index for material name search
            $table->index(['jenis_bahan'], 'idx_bahan_jenis'); // Index for material type filtering
            $table->index(['stok'], 'idx_bahan_stok'); // Index for stock filtering

            // Composite index for common search combinations
            $table->index(['nama', 'stok'], 'idx_bahan_nama_stok'); // Name + stock combo
            $table->index(['jenis_bahan', 'stok'], 'idx_bahan_jenis_stok'); // Type + stock combo

            // Fulltext index for advanced text search (if using MySQL with fulltext support)
            // $table->fullText(['nama', 'catatan'], 'ft_bahan_search'); // Uncomment if using MySQL 5.7+
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aset_aslabs', function (Blueprint $table) {
            // Drop indexes in reverse order
            $table->dropIndex('idx_aset_kode_stok');
            $table->dropIndex('idx_aset_nama_stok');
            $table->dropIndex('idx_aset_status');
            $table->dropIndex('idx_aset_stok');
            $table->dropIndex('idx_aset_kode');
            $table->dropIndex('idx_aset_nama');

            // Drop fulltext index if enabled
            // $table->dropFullText('ft_aset_search');
        });

        Schema::table('bahan', function (Blueprint $table) {
            // Drop indexes in reverse order
            $table->dropIndex('idx_bahan_jenis_stok');
            $table->dropIndex('idx_bahan_nama_stok');
            $table->dropIndex('idx_bahan_stok');
            $table->dropIndex('idx_bahan_jenis');
            $table->dropIndex('idx_bahan_nama');

            // Drop fulltext index if enabled
            // $table->dropFullText('ft_bahan_search');
        });
    }
};
