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
        Schema::create('absensi_praktikums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aslab_id')->constrained('users')->onDelete('cascade');
            $table->date('tanggal');
            $table->foreignId('dosen_praktikum_id')->constrained()->onDelete('cascade');
            $table->string('pertemuan');
            $table->enum('sebagai', ['instruktur', 'asisten']);
            $table->enum('kehadiran_dosen', ['hadir', 'tidak_hadir']);
            $table->foreignId('kelas_praktikum_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->index(['tanggal', 'kelas_praktikum_id']);
            $table->index(['aslab_id', 'tanggal']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensi_praktikums');
    }
};
