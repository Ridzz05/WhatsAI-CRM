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
        Schema::create('held_message_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->onDelete('cascade');
            $table->string('phone', 30);
            $table->string('customer_name', 100)->nullable();
            $table->text('message');
            $table->string('reason', 150);
            $table->string('status', 30)->default('held'); // 'held', 'restored', 'dismissed'
            $table->timestamp('muted_until')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('held_message_logs');
    }
};
