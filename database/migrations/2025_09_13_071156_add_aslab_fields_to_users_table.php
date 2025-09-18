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
        Schema::table('users', function (Blueprint $table) {
            $table->string('rfid_code')->unique()->nullable()->after('email');
            $table->string('prodi')->nullable()->after('rfid_code');
            $table->integer('semester')->nullable()->after('prodi');
            $table->enum('role', ['admin', 'aslab'])->default('aslab')->after('semester');
            $table->boolean('is_active')->default(true)->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rfid_code', 'prodi', 'semester', 'role', 'is_active']);
        });
    }
};
