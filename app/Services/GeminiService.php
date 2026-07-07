<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    /**
     * Generate response from Gemini API or fallback to local rule-based NLP engine.
     */
    public static function generateResponse($prompt, $conversationHistory = [])
    {
        $apiKey = env('GEMINI_API_KEY');
        if (empty($apiKey)) {
            return self::fallbackResponse($conversationHistory);
        }

        // Format conversation history for Gemini API
        $contents = [];
        
        // System instruction user message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => "SYSTEM INSTRUCTION:\n" . $prompt]]
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => "Siap, saya mengerti. Saya akan bertindak sebagai AI Membership Assistant Loyal Fitness yang ramah, natural, dan membantu."]]
        ];

        // Format history
        foreach ($conversationHistory as $chat) {
            $contents[] = [
                'role' => $chat['sender'] === 'user' ? 'user' : 'model',
                'parts' => [['text' => $chat['message']]]
            ];
        }

        try {
            // Using HTTP Client to call Gemini API directly with SSL verification disabled for local dev compatibility
            $response = Http::withoutVerifying()->withHeaders([
                'Content-Type' => 'application/json'
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}", [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 400,
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf kak, bisa diulangi?';
            }

            Log::error("Gemini API Error: " . $response->body());
        } catch (\Exception $e) {
            Log::error("Gemini Connection Error: " . $e->getMessage());
        }

        return self::fallbackResponse($conversationHistory);
    }

    /**
     * Highly responsive fallback rule-based NLP simulation matching the knowledge base in IMPLEMENT.md.
     */
    private static function fallbackResponse($history)
    {
        $lastMessage = '';
        foreach (array_reverse($history) as $chat) {
            if ($chat['sender'] === 'user') {
                $lastMessage = strtolower($chat['message']);
                break;
            }
        }

        if (empty($lastMessage)) {
            return "Halo kak! Saya AI Assistant Loyal Fitness. Ada yang bisa saya bantu terkait promo membership, jadwal kelas, fasilitas sauna, atau info lokasi gym kami hari ini?";
        }

        // 1. Pricing & Membership
        if (str_contains($lastMessage, 'harga') || str_contains($lastMessage, 'biaya') || str_contains($lastMessage, 'membership') || str_contains($lastMessage, 'bayar') || str_contains($lastMessage, 'sebulan')) {
            return "Untuk harga membership umum di Loyal Fitness mulai dari Rp 350.000/bulan kak. Tapi khusus bulan ini kita lagi ada Promo Juli hemat up to 30% untuk paket 12 bulan! Kakak lebih tertarik coba membership bulanan atau paket promo hemat?";
        }

        // 2. Promos
        if (str_contains($lastMessage, 'promo') || str_contains($lastMessage, 'diskon') || str_contains($lastMessage, 'hemat')) {
            return "Ada banget kak! Bulan ini kita ada Promo Juli: Paket 12 bulan cuma Rp 2.900.000 nett (jatuhnya cuma Rp 240 ribuan/bulan) + Free trial kelas zumba & yoga 2x. Promo ini berlaku sampai tanggal 25 saja kak. Gimana, mau saya bantu secure promonya dulu?";
        }

        // 3. Location & Parking
        if (str_contains($lastMessage, 'lokasi') || str_contains($lastMessage, 'alamat') || str_contains($lastMessage, 'dimana') || str_contains($lastMessage, 'rute')) {
            return "Lokasi Loyal Fitness ada di International Plaza Mall Palembang Lantai 2 kak. Tempatnya strategis, parkir luas flat flat saja (mobil Rp 5.000, motor Rp 3.000). Kakak tinggal di daerah mana kalau boleh tahu?";
        }

        // 4. Facilities & Equipment
        if (str_contains($lastMessage, 'fasilitas') || str_contains($lastMessage, 'sauna') || str_contains($lastMessage, 'alat') || str_contains($lastMessage, 'gym')) {
            return "Fasilitas kita lengkap banget kak! Mulai dari full AC, alat cardio & weight training lengkap, locker room, shower, sauna, gratis air minum isi ulang, sampai studio kelas (Zumba/Yoga/Pilates). Kakak biasanya fokus latihan beban atau suka ikut kelas?";
        }

        // 5. Classes
        if (str_contains($lastMessage, 'kelas') || str_contains($lastMessage, 'zumba') || str_contains($lastMessage, 'yoga') || str_contains($lastMessage, 'pilates') || str_contains($lastMessage, 'aerobik')) {
            return "Iya kak, di Loyal Fitness ada kelas Zumba, Yoga, Pilates, dan Aerobik gratis buat semua member aktif. Jadwal kelas ada setiap sore jam 17.00 dan weekend pagi. Kakak mau cari kelas zumba atau yoga?";
        }

        // 6. Personal Trainer
        if (str_contains($lastMessage, 'pt') || str_contains($lastMessage, 'personal trainer') || str_contains($lastMessage, 'pelatih') || str_contains($lastMessage, 'trainer')) {
            return "Untuk Personal Trainer (PT) kita ada sertifikasi internasional kak, tarifnya mulai dari Rp 1.500.000 untuk 10x pertemuan. Latihannya nanti dibikinkan program khusus sesuai target kakak (misal fat loss atau bikin otot). Sebelumnya kakak pernah latihan pakai PT?";
        }

        // 7. Goals
        if (str_contains($lastMessage, 'kurus') || str_contains($lastMessage, 'turun berat') || str_contains($lastMessage, 'gemuk') || str_contains($lastMessage, 'otot') || str_contains($lastMessage, 'sehat') || str_contains($lastMessage, 'target') || str_contains($lastMessage, 'tujuan')) {
            return "Ooh mantap kak! Untuk target kakak tersebut nanti bisa kita bantu buatkan rekomendasi program latihan pas kunjungan pertama. Kakak rencananya mau latihan sendiri atau mau dipandu Personal Trainer?";
        }

        // 8. Objections / Doubts
        if (str_contains($lastMessage, 'ragu') || str_contains($lastMessage, 'malas') || str_contains($lastMessage, 'konsisten') || str_contains($lastMessage, 'takut')) {
            return "Tenang saja kak, banyak member baru di sini yang awalnya juga ragu. Tapi di Loyal Fitness kita punya komunitas yang seru dan trainer ramah yang siap bantu dampingi biar kakak tetap semangat dan konsisten berlatih!";
        }

        // 9. Handover / Closing triggers
        if (str_contains($lastMessage, 'daftar') || str_contains($lastMessage, 'gabung') || str_contains($lastMessage, 'ikut') || str_contains($lastMessage, 'transfer') || str_contains($lastMessage, 'bayar') || str_contains($lastMessage, 'visit') || str_contains($lastMessage, 'datang')) {
            return "Wah siap kak! Biar lebih jelas dan dibantu cek promo yang aktif hari ini, bagaimana kalau kakak saya hubungkan ke tim CS/Marketing kami? Kakak juga bisa sekalian book jadwal visit/tour gym gratis besok. Boleh minta nama lengkapnya kak?";
        }

        return "Halo kak! Saya AI Assistant Loyal Fitness. Ada yang bisa saya bantu terkait promo membership, jadwal kelas, fasilitas sauna, atau info lokasi gym kami hari ini?";
    }
}
