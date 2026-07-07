<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Promo;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Users (Owner & CS Agent)
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Owner Loyal Fitness',
                'password' => Hash::make('password'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'marketing@example.com'],
            [
                'name' => 'Adinda (Marketing/CS)',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Create Initial Promos (AI Knowledge Base)
        Promo::create([
            'promo_name' => 'Promo Juli Hemat 12 Bulan',
            'description' => 'Paket membership gym terhemat dengan akses full fasilitas 1 tahun penuh.',
            'price' => 2900000.00,
            'bonus' => 'Free 2x Trial Kelas Zumba/Yoga & Tas Olahraga',
            'valid_until' => '2026-07-25',
            'terms' => 'Pembayaran lunas di awal (cash/transfer). Hanya untuk member baru.',
            'is_active' => true,
        ]);

        Promo::create([
            'promo_name' => 'Paket Pelajar & Mahasiswa',
            'description' => 'Harga khusus bulanan hemat bagi anak sekolah atau mahasiswa.',
            'price' => 250000.00,
            'bonus' => 'Gratis pemakaian fasilitas loker & shower',
            'valid_until' => '2026-12-31',
            'terms' => 'Wajib melampirkan foto Kartu Pelajar/Mahasiswa aktif saat pendaftaran.',
            'is_active' => true,
        ]);

        Promo::create([
            'promo_name' => 'Paket PT Fat Loss Starter',
            'description' => 'Bimbingan Personal Trainer bersertifikasi khusus target turun berat badan.',
            'price' => 1500000.00,
            'bonus' => 'Gratis konsultasi nutrisi & custom meal plan harian',
            'valid_until' => null,
            'terms' => 'Paket berisi 10x pertemuan. Berlaku 3 bulan sejak tanggal pembelian.',
            'is_active' => true,
        ]);

        // 3. Create Default System & Company Settings
        \App\Models\Setting::create([
            'company_name' => 'PT Solusi Mitra Mandiri',
            'company_website' => 'https://solusimitramandiri.com',
            'system_website' => 'https://loyalfitness.id',
            'instagram_url' => 'https://www.instagram.com/loyalfitnessindonesia?igsh=MWs2NzR6NGUwNGRpMg%3D%3D&utm_source=qr',
            'gym_name' => 'Loyal Fitness',
            'gym_address' => 'International Plaza Mall Palembang Lantai 2',
            'features_list' => "- *Face ID Access:* Check-in secepat kilat tanpa kartu atau aplikasi, cukup hadapkan wajah ke kamera.\n- *AI Posture Analysis:* Analisis postur tubuh klinis secara real-time untuk koreksi gerakan latihan.\n- *Progress Tracking:* Pantau grafik perkembangan otot & lemak tubuh secara real-time di HP.\n- *AI Planner:* Program latihan personal yang dibuat khusus oleh AI.\n- *Fasilitas Premium:* Full AC, alat beban lengkap, studio kelas (Zumba, Yoga, Pilates), loker, shower, sauna, dan air minum gratis.",
            'trainers_list' => "- *Coach Puput* (Certified Instructor)\n- *Coach Kaka* (Certified Instructor)\n- *Coach Hengky* (Certified Instructor)\n- *Coach Solihin* (Certified Instructor)\n- *Coach Putri Sang* (Certified Instructor)\n- *Coach Daud Jonathan* (Certified Instructor)\n- *Coach Wawan Kurniawan* (Certified Instructor)",
        ]);
    }
}
