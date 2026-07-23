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
        // 1. Branches Table
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('city')->default('Palembang');
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Add branch_id to leads table
        Schema::table('leads', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('assigned_to')->constrained('branches')->nullOnDelete();
        });

        // 3. Products & Inventory Table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('name');
            $table->string('sku')->nullable();
            $table->string('category')->default('General');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->integer('stock')->default(100);
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Invoices & Payment Links Table
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->string('invoice_number')->unique();
            $table->decimal('amount', 12, 2);
            $table->string('payment_status')->default('pending'); // pending, paid, expired
            $table->string('payment_method')->nullable();
            $table->text('payment_url')->nullable();
            $table->text('qris_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // 5. Memberships & Subscriptions Retention Table
        Schema::create('memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->string('plan_name');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('active'); // active, expired, cancelled
            $table->boolean('reminder_sent_h7')->default(false);
            $table->boolean('reminder_sent_h3')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memberships');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('products');
        
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
        });

        Schema::dropIfExists('branches');
    }
};
