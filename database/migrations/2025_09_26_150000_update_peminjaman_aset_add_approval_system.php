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
            // Update existing enum column
            $table->dropColumn('persetujuan');
        });

        Schema::table('peminjaman_aset', function (Blueprint $table) {
            // Add new approval system fields
            $table->enum('status', ['pending', 'approved', 'rejected', 'borrowed', 'returned'])->default('pending')->after('tanggal_kembali');
            $table->foreignId('approved_by')->nullable()->constrained('users')->after('status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('approval_note')->nullable()->after('approved_at');
            $table->text('keterangan')->nullable()->after('approval_note');
            $table->boolean('agreement_accepted')->default(false)->after('keterangan');
            $table->date('target_return_date')->nullable()->after('agreement_accepted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peminjaman_aset', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'status',
                'approved_by',
                'approved_at',
                'approval_note',
                'keterangan',
                'agreement_accepted',
                'target_return_date'
            ]);
            $table->enum('persetujuan', ['iya', 'tidak'])->default('tidak');
        });
    }
};
