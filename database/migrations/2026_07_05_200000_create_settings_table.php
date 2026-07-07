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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->default('PT Solusi Mitra Mandiri');
            $table->string('company_website')->default('https://solusimitramandiri.com');
            $table->string('system_website')->default('https://loyalfitness.id');
            $table->string('instagram_url')->default('https://www.instagram.com/loyalfitnessindonesia?igsh=MWs2NzR6NGUwNGRpMg%3D%3D&utm_source=qr');
            $table->string('gym_name')->default('Loyal Fitness');
            $table->string('gym_address')->default('International Plaza Mall Palembang Lantai 2');
            $table->text('features_list')->nullable();
            $table->text('trainers_list')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
