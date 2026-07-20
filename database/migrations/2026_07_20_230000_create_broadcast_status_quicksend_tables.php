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
        // 1. Broadcast Campaigns Table
        Schema::create('broadcasts', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->text('content');
            $table->string('attachment_type')->default('none'); // none, url, image
            $table->string('media_url')->nullable();
            $table->timestamp('send_schedule')->nullable();
            $table->string('recurrence_pattern')->default('once'); // once, daily, weekly, monthly
            $table->integer('delay_min')->default(2);
            $table->integer('delay_max')->default(5);
            $table->integer('chunk_size')->default(10);
            $table->integer('pause_min')->default(10);
            $table->integer('pause_max')->default(20);
            $table->string('status')->default('draft'); // draft, scheduled, processing, completed, failed
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->timestamps();
        });

        // 2. Broadcast Recipients Table
        Schema::create('broadcast_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('broadcast_id')->constrained('broadcasts')->cascadeOnDelete();
            $table->string('phone');
            $table->string('name')->nullable();
            $table->string('status')->default('pending'); // pending, sent, failed
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // 3. WA Status Stories Schedule Table
        Schema::create('wa_statuses', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->string('bg_color')->default('#075e54');
            $table->timestamp('scheduled_at')->nullable();
            $table->string('status')->default('terjadwal'); // terjadwal, terkirim, gagal
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // 4. Quick Send Logs Table
        Schema::create('quick_send_logs', function (Blueprint $table) {
            $table->id();
            $table->string('phone');
            $table->string('name')->nullable();
            $table->text('message');
            $table->string('channel')->default('openwa');
            $table->string('status')->default('terkirim'); // terkirim, gagal
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quick_send_logs');
        Schema::dropIfExists('wa_statuses');
        Schema::dropIfExists('broadcast_recipients');
        Schema::dropIfExists('broadcasts');
    }
};
