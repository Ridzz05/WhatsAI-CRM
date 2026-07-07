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
        // 1. Promos Table (Knowledge Base component)
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('promo_name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('bonus')->nullable();
            $table->date('valid_until')->nullable();
            $table->text('terms')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Leads Table
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('phone');
            $table->string('goal')->nullable();
            $table->string('interest')->nullable();
            $table->string('budget')->nullable();
            $table->string('location')->nullable();
            $table->string('status')->default('New Lead'); // New Lead, Cold, Warm, Hot, Handover to CS, Visit Scheduled, Closed Won, Closed Lost
            $table->integer('lead_score')->default(0);
            $table->boolean('followup_sent')->default(false);
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 3. Conversations Table
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->string('sender'); // user, ai, cs
            $table->text('message');
            $table->timestamp('created_at')->useCurrent();
        });

        // 4. Handovers Table
        Schema::create('handovers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->text('summary');
            $table->string('reason')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending'); // pending, resolved
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('handovers');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('leads');
        Schema::dropIfExists('promos');
    }
};
