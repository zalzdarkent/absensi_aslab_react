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
        Schema::table('peminjaman_aset', function (Blueprint $table) {
            $table->string('manual_borrower_name')->nullable()->after('agreement_accepted');
            $table->string('manual_borrower_phone', 20)->nullable()->after('manual_borrower_name');
            $table->string('manual_borrower_class', 100)->nullable()->after('manual_borrower_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peminjaman_aset', function (Blueprint $table) {
            $table->dropColumn(['manual_borrower_name', 'manual_borrower_phone', 'manual_borrower_class']);
        });
    }
};
