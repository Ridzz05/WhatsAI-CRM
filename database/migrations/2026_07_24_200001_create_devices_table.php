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
        // 1. Devices Table (Multi-WhatsApp Sessions)
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('session_id')->unique();
            $table->string('phone_number')->nullable();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('status')->default('disconnected'); // connected, disconnected, qr_ready
            $table->text('qr_code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Add device_id to leads table
        Schema::table('leads', function (Blueprint $table) {
            $table->foreignId('device_id')->nullable()->after('branch_id')->constrained('devices')->nullOnDelete();
        });

        // 3. Add device_id to conversations table
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('device_id')->nullable()->after('lead_id')->constrained('devices')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
            $table->dropColumn('device_id');
        });

        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
            $table->dropColumn('device_id');
        });

        Schema::dropIfExists('devices');
    }
};
