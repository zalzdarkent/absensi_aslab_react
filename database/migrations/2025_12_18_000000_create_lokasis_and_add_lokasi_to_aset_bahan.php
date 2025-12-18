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
        Schema::create('lokasis', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lokasi')->unique();
            $table->timestamps();
        });

        Schema::table('aset_aslabs', function (Blueprint $table) {
            $table->foreignId('lokasi_id')
                ->after('jenis_id')
                ->constrained('lokasis')
                ->onDelete('restrict');
        });

        Schema::table('bahan', function (Blueprint $table) {
            $table->foreignId('lokasi_id')
                ->after('nama')
                ->constrained('lokasis')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aset_aslabs', function (Blueprint $table) {
            $table->dropForeign(['lokasi_id']);
            $table->dropColumn('lokasi_id');
        });

        Schema::table('bahan', function (Blueprint $table) {
            $table->dropForeign(['lokasi_id']);
            $table->dropColumn('lokasi_id');
        });

        Schema::dropIfExists('lokasis');
    }
};


