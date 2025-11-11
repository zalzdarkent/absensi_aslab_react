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
        Schema::create('jenis_aset_aslabs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_jenis_aset')->unique();
            $table->timestamps();
        });

        Schema::create('aset_aslabs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_aset');
            $table->foreignId('jenis_id')->constrained('jenis_aset_aslabs')->onDelete('cascade');
            $table->string('kode_aset');
            $table->string('nomor_seri')->nullable();
            $table->integer('stok');
            $table->enum('status', ['baik', 'kurang_baik', 'tidak_baik', 'dipinjam', 'sudah_dikembalikan'])->default('baik');
            $table->text('catatan')->nullable();
            $table->string('gambar');
            $table->timestamps();
        });

        Schema::create('bahan', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('jenis_bahan');
            $table->integer('stok');
            $table->text('catatan')->nullable();
            $table->string('gambar');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jenis_aset_aslabs');
        Schema::dropIfExists('aset_aslabs');
        Schema::dropIfExists('bahan');
    }
};
