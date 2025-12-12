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
        Schema::create('dosen_mata_kuliah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dosen_praktikum_id')->constrained()->onDelete('cascade');
            $table->foreignId('mata_kuliah_praktikum_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->index(['dosen_praktikum_id', 'mata_kuliah_praktikum_id'], 'dosen_matkul_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dosen_mata_kuliah');
    }
};
