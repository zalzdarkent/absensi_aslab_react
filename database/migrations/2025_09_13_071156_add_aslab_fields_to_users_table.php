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
            if (!Schema::hasColumn('users', 'rfid_code')) {
                $table->string('rfid_code')->unique()->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'prodi')) {
                $table->string('prodi')->nullable()->after('rfid_code');
            }
            if (!Schema::hasColumn('users', 'semester')) {
                $table->integer('semester')->nullable()->after('prodi');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'aslab'])->default('aslab')->after('semester');
            }
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('role');
            }
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
