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
        Schema::table('absensi_praktikums', function (Blueprint $table) {
            // Drop old foreign key if exists
            $table->dropForeign(['kelas_praktikum_id']);

            // Rename column
            $table->renameColumn('kelas_praktikum_id', 'kelas_id');
        });

        // Add new foreign key in a separate statement
        Schema::table('absensi_praktikums', function (Blueprint $table) {
            $table->foreign('kelas_id')->references('id')->on('kelas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absensi_praktikums', function (Blueprint $table) {
            // Drop new foreign key
            $table->dropForeign(['kelas_id']);

            // Rename column back
            $table->renameColumn('kelas_id', 'kelas_praktikum_id');
        });

        // Add old foreign key back
        Schema::table('absensi_praktikums', function (Blueprint $table) {
            $table->foreign('kelas_praktikum_id')->references('id')->on('kelas_praktikums')->onDelete('cascade');
        });
    }
};
