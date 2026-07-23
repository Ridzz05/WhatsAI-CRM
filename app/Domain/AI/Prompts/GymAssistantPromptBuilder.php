<?php

namespace App\Domain\AI\Prompts;

use App\Models\Setting;
use App\Models\Promo;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class GymAssistantPromptBuilder
{
    /**
     * Build system prompt for AI sales assistant.
     */
    public static function build(array $promos = [], ?Setting $setting = null): string
    {
        $setting = $setting ?? Cache::remember('crm_setting_first', 300, fn() => Setting::first());
        $promos = empty($promos) ? Cache::remember('crm_active_promos', 300, fn() => Promo::where('is_active', true)->get()->toArray()) : $promos;
        $products = Cache::remember('crm_active_products', 300, fn() => \App\Models\Product::where('is_active', true)->get()->toArray());
        $branches = Cache::remember('crm_active_branches', 300, fn() => \App\Models\Branch::where('is_active', true)->get()->toArray());

        $gymName = $setting->gym_name ?? 'Loyal Fitness IP';
        $location = $setting->location ?? 'International Plaza Mall Palembang Lantai 2';

        // Calculate dynamic Jakarta WIB greeting
        $hour = (int) Carbon::now('Asia/Jakarta')->format('H');
        if ($hour >= 5 && $hour < 11) {
            $greeting = 'Selamat pagi';
        } elseif ($hour >= 11 && $hour < 15) {
            $greeting = 'Selamat siang';
        } elseif ($hour >= 15 && $hour < 18) {
            $greeting = 'Selamat sore';
        } else {
            $greeting = 'Selamat malam';
        }

        $promoText = "";
        foreach ($promos as $p) {
            $promoText .= "- " . ($p['promo_name'] ?? $p->promo_name) . ": Rp " . number_format($p['price'] ?? $p->price, 0, ',', '.') . " (" . ($p['description'] ?? $p->description) . ")\n";
        }

        $productText = "";
        foreach ($products as $pr) {
            $productText .= "- " . $pr['name'] . " (" . $pr['category'] . "): Rp " . number_format($pr['price'], 0, ',', '.') . " (Stok: " . $pr['stock'] . " pcs) - " . $pr['description'] . "\n";
        }

        $branchText = "";
        foreach ($branches as $b) {
            $branchText .= "- Cabang " . $b['name'] . " (" . $b['code'] . "): " . $b['address'] . "\n";
        }

        return <<<PROMPT
Kamu adalah AI Membership Consultant & Sales Assistant UMKM resmi untuk {$gymName} ({$location}).

Lokasi Cabang Resmi:
{$branchText}

Katalog Produk & Suplemen Aktif:
{$productText}

Promo & Paket Aktif:
{$promoText}

Tugas & SOP kamu:
1. Awali sapaan awal dengan ramah ("{$greeting} kak!").
2. Tanya nama dan tujuan latihan calon member (misal fat loss, membentuk badan, suplemen, atau ikut kelas).
3. Jika calon pembeli bertanya suplemen, barang retail, atau presale, jelaskan produk dari katalog di atas dengan ramah.
4. Jangan langsung membocorkan harga penuh di awal obrolan sebelum mengetahui kebutuhan pelanggan.
5. Jika calon member terlihat sangat berminat (mau daftar, beli produk, tanya cara bayar/DP, atau tanya jadwal visit), berikan ringkasan ramah dan rekomendasikan bayar via WA / hubungkan ke CS manusia.
6. Gunakan bahasa Indonesia yang santai, sopan, natural, dan tidak kaku seperti robot.
PROMPT;
    }
}
