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
            ['email' => 'popi@example.com'],
            [
                'name' => 'Popi (Marketing/CS)',
                'password' => Hash::make('password'),
                'phone' => '62895604631765',
            ]
        );

        User::updateOrCreate(
            ['email' => 'ayu@example.com'],
            [
                'name' => 'Ayu (Marketing/CS)',
                'password' => Hash::make('password'),
                'phone' => '6285367394199',
            ]
        );

        User::updateOrCreate(
            ['email' => 'indah@example.com'],
            [
                'name' => 'Indah (Marketing/CS)',
                'password' => Hash::make('password'),
                'phone' => '6281314420857',
            ]
        );

        User::updateOrCreate(
            ['email' => 'lenny@example.com'],
            [
                'name' => 'Lenny (Marketing/CS)',
                'password' => Hash::make('password'),
                'phone' => '6281929924446',
            ]
        );

        User::updateOrCreate(
            ['email' => 'mesi@example.com'],
            [
                'name' => 'Mesi Lenny (Marketing/CS)',
                'password' => Hash::make('password'),
                'phone' => '6282160149532',
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

        // 4. Create Default Branches
        $branchIP = \App\Models\Branch::create([
            'name' => 'Loyal Fitness IP Mall',
            'code' => 'LF-IP',
            'city' => 'Palembang',
            'address' => 'International Plaza Mall Palembang Lantai 2',
            'phone' => '6281234567890',
            'is_active' => true,
        ]);

        $branchPS = \App\Models\Branch::create([
            'name' => 'Loyal Fitness Prime Palembang Square',
            'code' => 'LF-PS',
            'city' => 'Palembang',
            'address' => 'Palembang Square Mall Lantai 1 (24 Jam)',
            'phone' => '6289876543210',
            'is_active' => true,
        ]);

        // 5. Create Default Product Catalog (UMKM Items)
        \App\Models\Product::create([
            'branch_id' => $branchIP->id,
            'name' => 'Whey Protein Isolate 2Lbs',
            'sku' => 'SUPP-WHEY-01',
            'category' => 'Suplemen',
            'description' => 'Protein murni 25g per serving untuk mempercepat pembentukan otot.',
            'price' => 450000.00,
            'stock' => 25,
            'is_active' => true,
        ]);

        \App\Models\Product::create([
            'branch_id' => $branchIP->id,
            'name' => 'Tas Gym Signature Loyal Fitness',
            'sku' => 'MERCH-BAG-01',
            'category' => 'Merchandise',
            'description' => 'Tas duffel gym tahan air dengan kompartemen sepatu terpisah.',
            'price' => 175000.00,
            'stock' => 50,
            'is_active' => true,
        ]);

        \App\Models\Product::create([
            'branch_id' => $branchPS->id,
            'name' => 'Voucher Presale Membership 12 Bulan (PS 24 Jam)',
            'sku' => 'VOUCHER-PS-12M',
            'category' => 'Voucher Presale',
            'description' => 'Voucher presale akses 24 jam Loyal Fitness Prime Palembang Square.',
            'price' => 2400000.00,
            'stock' => 100,
            'is_active' => true,
        ]);
    }
}
