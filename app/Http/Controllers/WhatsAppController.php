<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Conversation;
use App\Models\Promo;
use App\Models\Handover;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WhatsAppController extends Controller
{
    /**
     * Get list of all leads.
     */
    public function getLeads()
    {
        $leads = Lead::with(['assignedUser'])
            ->withCount('conversations')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'leads' => $leads
        ]);
    }

    /**
     * Get chat history of a lead.
     */
    public function getLeadConversations($id)
    {
        $conversations = Conversation::where('lead_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'conversations' => $conversations
        ]);
    }

    /**
     * Check dashboard CRM stats.
     */
    public function getDashboardStats()
    {
        $totalLeads = Lead::count();
        $coldLeads = Lead::whereBetween('lead_score', [0, 40])->count();
        $warmLeads = Lead::whereBetween('lead_score', [41, 69])->count();
        $hotLeads = Lead::where('lead_score', '>=', 70)->count();
        
        $statusCounts = Lead::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        $handoversCount = Handover::where('status', 'pending')->count();

        $gatewayStatus = \Illuminate\Support\Facades\Cache::get('whatsapp_gateway_status', 'disconnected');
        $gatewayQr = \Illuminate\Support\Facades\Cache::get('whatsapp_gateway_qr', null);

        return response()->json([
            'total_leads' => $totalLeads,
            'cold' => $coldLeads,
            'warm' => $warmLeads,
            'hot' => $hotLeads,
            'handovers_pending' => $handoversCount,
            'statuses' => $statusCounts,
            'gateway_status' => $gatewayStatus,
            'gateway_qr' => $gatewayQr,
        ]);
    }

    /**
     * Update Baileys WhatsApp Gateway connection status.
     */
    public function updateGatewayStatus(Request $request)
    {
        $request->validate([
            'status' => 'required|string',
            'qr' => 'nullable|string'
        ]);

        \Illuminate\Support\Facades\Cache::put('whatsapp_gateway_status', $request->status, 90); // Keep alive for 90s

        if ($request->has('qr') && !empty($request->qr)) {
            \Illuminate\Support\Facades\Cache::put('whatsapp_gateway_qr', $request->qr, 90); // Keep alive for 90s
        }

        if ($request->status === 'connected') {
            \Illuminate\Support\Facades\Cache::forget('whatsapp_gateway_qr');
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Assign lead to a user/CS agent.
     */
    public function assignLead(Request $request, Lead $lead)
    {
        $request->validate([
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        $lead->update([
            'assigned_to' => $request->assigned_to
        ]);

        return response()->json([
            'success' => true,
            'lead' => $lead->load('assignedUser')
        ]);
    }

    /**
     * Update lead follow-up status.
     */
    public function updateLeadStatus(Request $request, Lead $lead)
    {
        $request->validate([
            'status' => 'required|string'
        ]);

        $lead->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'lead' => $lead
        ]);
    }

    /**
     * Webhook Simulation API Route (triggered from frontend UI simulator).
     */
    public function simulateChat(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string',
            'name' => 'nullable|string',
        ]);

        $result = $this->processIncomingMessage(
            $request->phone, 
            $request->message, 
            $request->name
        );

        return response()->json([
            'success' => true,
            'lead' => $result['lead']->load('assignedUser'),
            'conversations' => Conversation::where('lead_id', $result['lead']->id)->orderBy('created_at', 'asc')->get()
        ]);
    }

    /**
     * Real Production WhatsApp Webhook (Ex: Fonnte/Wablas integration).
     * Excluded from CSRF validation in bootstrap/app.php.
     */
    public function handleWebhook(Request $request)
    {
        // Fonnte webhook parameter mapping
        $phone = $request->input('sender'); 
        $messageText = $request->input('message');
        
        if (empty($phone) || empty($messageText)) {
            return response()->json(['status' => 'error', 'message' => 'Missing sender/message parameter'], 400);
        }

        // Process chat and generate AI response
        $result = $this->processIncomingMessage($phone, $messageText, null);
        
        // Outgoing API trigger to reply message back to user's phone via Fonnte Gateway
        $token = env('FONNTE_TOKEN');
        if (!empty($token)) {
            \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $phone,
                'message' => $result['ai_response'],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'ai_response' => $result['ai_response']
        ]);
    }

    /**
     * Centralized processing engine for all incoming chats (simulated or real).
     */
    private function processIncomingMessage($phone, $messageText, $name = null)
    {
        // Find or create Lead
        $lead = Lead::firstOrCreate(
            ['phone' => $phone],
            [
                'name' => $name ?: 'Calon Member',
                'status' => 'New Lead',
                'lead_score' => 20 // Default score on first chat
            ]
        );

        // Reset follow-up status on new incoming message from the customer
        $lead->followup_sent = false;

        // Save incoming user message
        Conversation::create([
            'lead_id' => $lead->id,
            'sender' => 'user',
            'message' => $messageText,
        ]);

        // 1. Lead Qualification Parsing (Intent & Parameter Extraction)
        $lowerMsg = strtolower($messageText);

        // Extract Goal
        if (str_contains($lowerMsg, 'kurus') || str_contains($lowerMsg, 'turun berat') || str_contains($lowerMsg, 'diet') || str_contains($lowerMsg, 'fat loss')) {
            $lead->goal = 'Turun Berat Badan';
        } elseif (str_contains($lowerMsg, 'otot') || str_contains($lowerMsg, 'gemuk') || str_contains($lowerMsg, 'besarkan badan') || str_contains($lowerMsg, 'bulking')) {
            $lead->goal = 'Bentuk Badan';
        } elseif (str_contains($lowerMsg, 'sehat') || str_contains($lowerMsg, 'bugar') || str_contains($lowerMsg, 'jaga kondisi')) {
            $lead->goal = 'Kesehatan';
        }

        // Extract Interest
        if (str_contains($lowerMsg, 'pt') || str_contains($lowerMsg, 'personal trainer') || str_contains($lowerMsg, 'pelatih')) {
            $lead->interest = 'Personal Trainer';
        } elseif (str_contains($lowerMsg, 'zumba') || str_contains($lowerMsg, 'yoga') || str_contains($lowerMsg, 'kelas') || str_contains($lowerMsg, 'pilates')) {
            $lead->interest = 'Kelas Gym';
        } elseif (str_contains($lowerMsg, 'membership') || str_contains($lowerMsg, 'bulan') || str_contains($lowerMsg, 'member')) {
            $lead->interest = 'Membership';
        }

        // Extract Location (Simple search)
        if (str_contains($lowerMsg, 'plaju') || str_contains($lowerMsg, 'kertapati') || str_contains($lowerMsg, 'km ') || str_contains($lowerMsg, 'sudirman') || str_contains($lowerMsg, 'palembang')) {
            $words = explode(' ', $lowerMsg);
            $loc = 'Palembang';
            foreach ($words as $w) {
                if (in_array($w, ['plaju', 'kertapati', 'sudirman', 'sako', 'kententen'])) {
                    $loc = ucfirst($w);
                    break;
                }
            }
            $lead->location = $loc;
        }

        // 2. Lead Scoring engine (Benchmarks from IMPLEMENT.md)
        $currentScore = $lead->lead_score;
        $newScore = 20; // Default base

        if (str_contains($lowerMsg, 'daftar') || str_contains($lowerMsg, 'gabung') || str_contains($lowerMsg, 'ikut') || str_contains($lowerMsg, 'registrasi')) {
            $newScore = 80;
        }
        if (str_contains($lowerMsg, 'transfer') || str_contains($lowerMsg, 'bayar') || str_contains($lowerMsg, 'dp') || str_contains($lowerMsg, 'rekening')) {
            $newScore = 90;
        }
        if (str_contains($lowerMsg, 'datang') || str_contains($lowerMsg, 'visit') || str_contains($lowerMsg, 'mampir') || str_contains($lowerMsg, 'besok')) {
            $newScore = 70;
        }
        if (str_contains($lowerMsg, 'lokasi') || str_contains($lowerMsg, 'alamat') || str_contains($lowerMsg, 'dimana') || str_contains($lowerMsg, 'mall')) {
            $newScore = 50;
        }
        if (str_contains($lowerMsg, 'promo') || str_contains($lowerMsg, 'diskon') || str_contains($lowerMsg, 'hemat')) {
            $newScore = 40;
        }
        if (str_contains($lowerMsg, 'fasilitas') || str_contains($lowerMsg, 'sauna') || str_contains($lowerMsg, 'alat')) {
            $newScore = 30;
        }
        if (str_contains($lowerMsg, 'harga') || str_contains($lowerMsg, 'biaya') || str_contains($lowerMsg, 'membership')) {
            $newScore = 20;
        }

        // Explicit direct closing triggers (Instant Hot Lead)
        if (str_contains($lowerMsg, 'saya mau daftar') || str_contains($lowerMsg, 'bisa bayar sekarang') || str_contains($lowerMsg, 'minta nomor rekening')) {
            $newScore = 100;
        }

        // Update score if it's higher than the current one
        if ($newScore > $currentScore) {
            $lead->lead_score = $newScore;
        }

        // Determine Lead status category (only if not already under human management)
        if (!in_array($lead->status, ['Handover to CS', 'Visit Scheduled', 'Closed Won', 'Closed Lost'])) {
            if ($lead->lead_score >= 70) {
                $lead->status = 'Hot';
            } elseif ($lead->lead_score >= 41) {
                $lead->status = 'Warm';
            } else {
                $lead->status = 'Cold';
            }
        }

        $lead->save();

        // 3. Human Handover check (Fase 1 CRM integration)
        $isHandoverTriggered = false;
        
        $closingKeywords = [
            'saya mau daftar', 'bisa bayar sekarang', 'besok saya datang', 
            'harga final berapa', 'ada nomor marketing', 'saya mau ambil promo',
            'bisa dp dulu', 'saya ke sana jam berapa'
        ];
        
        $hasClosingKeyword = false;
        foreach ($closingKeywords as $kw) {
            if (str_contains($lowerMsg, $kw)) {
                $hasClosingKeyword = true;
                break;
            }
        }

        $isHumanManaged = in_array($lead->status, ['Handover to CS', 'Visit Scheduled', 'Closed Won', 'Closed Lost']);

        if (($lead->lead_score >= 70 || $hasClosingKeyword) && !$isHumanManaged) {
            $lead->status = 'Handover to CS';
            $lead->save();

            // Create Handover record
            Handover::create([
                'lead_id' => $lead->id,
                'summary' => "Calon member (" . ($lead->name ?: 'Customer') . ") tertarik mendaftar. Minat: " . ($lead->interest ?: 'Belum ditentukan') . ", Target latihan: " . ($lead->goal ?: 'Kesehatan') . ", Domisili: " . ($lead->location ?: 'Palembang') . ". Skor leads: " . $lead->lead_score . "%",
                'reason' => $hasClosingKeyword ? 'Explicit request/payment query' : 'Hot lead threshold reached',
                'status' => 'pending'
            ]);

            $isHandoverTriggered = true;
            $aiResponse = "Siap kak, sepertinya kakak sudah cocok ya. Data kakak segera saya teruskan agar langsung di-follow up lebih lanjut oleh *Membership Consultant* kami untuk proses pendaftaran, penawaran harga terbaik, dan konfirmasi jadwal visit kakak. Rekan kami akan segera menghubungi kakak lewat WhatsApp ini ya kak! Terima kasih banyak kak. 🙏";
        } elseif ($isHumanManaged) {
            // Mute the AI once it has been handed over to human CS agents
            return [
                'lead' => $lead,
                'ai_response' => null
            ];
        } else {
            // 4. Run AI Conversation Engine
            $promosList = Promo::where('is_active', true)->get();
            $promosText = "";
            foreach ($promosList as $p) {
                $promosText .= "- {$p->promo_name}: Rp " . number_format($p->price, 0, ',', '.') . " (Bonus: {$p->bonus}, Berlaku s/d: " . ($p->valid_until ? $p->valid_until->format('d-m-Y') : 'Selesai') . ")\n";
            }

            // Fetch settings
            $settings = \App\Models\Setting::first();
            $companyName = $settings->company_name ?? 'PT Solusi Mitra Mandiri';
            $companyWebsite = $settings->company_website ?? 'https://solusimitramandiri.com';
            $systemWebsite = $settings->system_website ?? 'https://loyalfitness.id';
            $instagramUrl = $settings->instagram_url ?? 'https://www.instagram.com/loyalfitnessindonesia?igsh=MWs2NzR6NGUwNGRpMg%3D%3D&utm_source=qr';
            $gymName = $settings->gym_name ?? 'Loyal Fitness';
            $gymAddress = $settings->gym_address ?? 'International Plaza Mall Palembang Lantai 2';
            $featuresList = $settings->features_list ?? '';
            $trainersList = $settings->trainers_list ?? '';

            // Fetch dynamic web reader content (cached for 12 hours)
            $systemWebContent = \App\Services\WebReaderService::getContent($systemWebsite);
            $companyWebContent = \App\Services\WebReaderService::getContent($companyWebsite);

            // Determine local greeting time based on Asia/Jakarta (WIB) hour
            $currentHour = (int)\Carbon\Carbon::now('Asia/Jakarta')->format('H');
            $greetingTime = 'malam';
            if ($currentHour >= 5 && $currentHour < 11) {
                $greetingTime = 'pagi';
            } elseif ($currentHour >= 11 && $currentHour < 15) {
                $greetingTime = 'siang';
            } elseif ($currentHour >= 15 && $currentHour < 18) {
                $greetingTime = 'sore';
            }

            // Build detailed prompt knowledge base
            $prompt = "Kamu adalah AI Membership Assistant resmi untuk {$gymName} (di bawah naungan perusahaan {$companyName}).\n\n"
                    . "Karakter & Format Balasan:\n"
                    . "- Ramah, sopan, natural, tidak kaku (seperti mengobrol santai lewat WhatsApp).\n"
                    . "- Jawaban singkat padat (maksimal 2-3 kalimat per balasan).\n"
                    . "- Gunakan sebutan 'kakak' atau 'kak'.\n"
                    . "- Gunakan jeda baris baru (line breaks) dan bullet points agar pesan terstruktur rapi, jangan gabungkan semua link dalam satu baris paragraf.\n"
                    . "- Gunakan format tebal khas WhatsApp (*teks*) pada judul atau poin penting agar menarik dibaca.\n"
                    . "- Gunakan emoji secara sangat hemat (maksimal 1 emoji saja per seluruh pesan) dan hanya pada poin yang sangat relevan. Hindari spam emoji berlebihan.\n\n"
                    . "Alur Percakapan Wajib & Tahapan Chat (Step-by-Step):\n"
                    . "1. *Sapaan & Perkenalan Awal:* Jika chat ini adalah sapaan pertama/awal dari calon member, kamu wajib menyapa dengan menggunakan salam *'Selamat {$greetingTime}'*.\n"
                    . "2. *Perkenalkan Diri:* Selalu perkenalkan dirimu sebagai AI Assistant resmi dari {$gymName} (Contoh: 'Perkenalkan saya AI Assistant dari {$gymName}...').\n"
                    . "3. *Tanya Identitas & Goals:* Setelah menyapa dan berkenalan, langsung tanyakan nama mereka dan tujuan olahraga mereka dengan kalimat: *'Dengan kakak siapa kalau boleh tahu, dan target/goals olahraganya apa?'*.\n"
                    . "4. *Batasi Info Harga & Promo:* JANGAN PERNAH memberikan rincian harga lengkap atau daftar nama promo (seperti Promo Juli Hemat Rp 2.900.000, Paket Pelajar Rp 250.000, dll.) di awal percakapan sebelum calon member memberikan nama dan target olahraga mereka. Jika ditanya tentang harga atau promo di awal, kamu HANYA boleh menjawab secara diplomatis bahwa biaya keanggotaan kami *mulai dari Rp 240.000-an per bulan* dengan minimal pembelian 3, 6, atau 12 bulan, kemudian langsung tanyakan nama dan target goals mereka.\n"
                    . "5. *Undang untuk Visit (Invitation):* Berikan undangan ramah bagi mereka untuk datang visit/tour langsung ke gym {$gymName} agar bisa melihat fasilitas secara langsung dan mencoba sesi latihan gratis (free trial).\n"
                    . "6. *Fokus Kebutuhan:* Fokuslah membantu menggali kebutuhan, goal fisik (turun berat badan, sehat, kelas), dan kendala mereka terlebih dahulu sebelum membicarakan penawaran closing/pendaftaran.\n\n"
                    . "Aturan Penting:\n"
                    . "1. Jawab HANYA berdasarkan Knowledge Base di bawah. Jangan mengarang harga atau janji.\n"
                    . "2. JANGAN PERNAH menyalin atau mengirimkan rincian daftar promo di bawah secara mentah-mentah jika calon member belum melewati tahapan pengenalan nama & goals. Selalu rahasiakan harga/promo detail di awal chat.\n"
                    . "3. Tampilkan semua promo aktif yang dikirimkan dalam database secara jujur dan lengkap di dalam daftar promo apabila percakapan sudah di tahap lanjut (sudah tahu nama & goals calon member). Jangan pernah menyembunyikan atau memfilter promo apa pun meskipun terdengar seperti uji coba (seperti Promo Menjadi Sigma).\n"
                    . "4. Jika ditanya info yang tidak ada di database, katakan bahwa tim CS kami akan menjelaskan lebih detail nanti saat kunjungan.\n"
                    . "5. Jika calon member serius ingin mendaftar, ingin datang, atau ingin bayar/transfer, beritahu mereka bahwa data mereka segera diteruskan untuk di-follow up lebih lanjut oleh *Membership Consultant* kami.\n"
                    . "6. Jika ditanya mengenai website utama perusahaan, berikan website: {$companyWebsite}.\n"
                    . "7. Jika ditanya mengenai sistem aplikasi / ERP / website member, berikan website: {$systemWebsite}.\n"
                    . "8. Jika ditanya mengenai Instagram resmi gym, berikan tautan Instagram: {$instagramUrl}.\n"
                    . "9. JANGAN PERNAH gunakan format link markdown seperti [nama](url) atau tanda kurung pada tautan. Tuliskan link secara mentah (raw URL) langsung di dalam kalimat agar bisa langsung diklik oleh pengguna di WhatsApp, contoh: https://loyalfitness.id atau https://solusimitramandiri.com.\n"
                    . "10. Susun penyajian informasi website/social media dengan baris baru terpisah menggunakan format rapi:\n"
                    . "   🌐 *Website Perusahaan:* [link]\n"
                    . "   💻 *Aplikasi Member:* [link]\n"
                    . "   📸 *Instagram Resmi:* [link]\n\n"
                    . "KNOWLEDGE BASE LOYAL FITNESS:\n"
                    . "Nama Gym: {$gymName}\n"
                    . "Lokasi: {$gymAddress}. Parkir mobil Rp 5.000 flat, motor Rp 3.000 flat.\n"
                    . "Website Utama Perusahaan: {$companyWebsite}\n"
                    . "Website Aplikasi & Sistem ERP: {$systemWebsite}\n"
                    . "Instagram Resmi: {$instagramUrl}\n"
                    . (!empty($companyWebContent) ? "Informasi Tambahan Profil Perusahaan (Web Reader): {$companyWebContent}\n" : "")
                    . (!empty($systemWebContent) ? "Informasi Tambahan Sistem & Aplikasi Gym (Web Reader): {$systemWebContent}\n" : "")
                    . "Daftar Fitur & Fasilitas Terlengkap:\n"
                    . (empty($featuresList) ? "- *Face ID Access:* Check-in secepat kilat tanpa kartu atau aplikasi.\n- *AI Posture Analysis:* Analisis postur klinis secara real-time.\n- *Progress Tracking:* Pantau grafik perkembangan otot & lemak tubuh.\n- *Locker, Shower & Sauna*\n" : $featuresList . "\n")
                    . "Daftar Personal Trainer (PT) Aktif:\n"
                    . (empty($trainersList) ? "- *Coach Ayu* (Yoga & Pilates)\n- *Coach Poppy* (Strength)\n- *Coach Lenny* (Zumba)\n- *Coach Indah* (Fat Loss)\n" : $trainersList . "\n")
                    . "Daftar Promo Aktif:\n"
                    . (empty($promosText) ? "- Promo Member Bulanan umum: Rp 350.000/bulan\n" : $promosText)
                    . "Jadwal Kelas: Sore jam 17:00 weekdays, pagi jam 08:00 weekends.\n"
                    . "Biaya Personal Trainer (PT): Mulai dari Rp 1.500.000 untuk 10 kali latihan.";

            // Fetch chat history
            $chatHistory = Conversation::where('lead_id', $lead->id)
                ->orderBy('created_at', 'asc')
                ->get()
                ->toArray();

            $aiResponse = AiService::generateResponse($prompt, $chatHistory);
        }

        // Save AI reply
        Conversation::create([
            'lead_id' => $lead->id,
            'sender' => 'ai',
            'message' => $aiResponse,
        ]);

        return [
            'lead' => $lead,
            'ai_response' => $aiResponse
        ];
    }

    /**
     * Render system and company configurations settings page.
     */
    public function settingsPage()
    {
        $settings = \App\Models\Setting::first();
        return \Inertia\Inertia::render('Settings/Index', [
            'settings' => $settings
        ]);
    }

    /**
     * Save new system and company website settings.
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string',
            'company_website' => 'required|url',
            'system_website' => 'required|url',
            'instagram_url' => 'required|url',
            'gym_name' => 'required|string',
            'gym_address' => 'required|string',
            'features_list' => 'nullable|string',
            'trainers_list' => 'nullable|string',
        ]);

        $settings = \App\Models\Setting::first();
        if ($settings) {
            // Clear cache if URL changes to reload content
            if ($settings->company_website !== $request->company_website) {
                \App\Services\WebReaderService::clearCache($settings->company_website);
            }
            if ($settings->system_website !== $request->system_website) {
                \App\Services\WebReaderService::clearCache($settings->system_website);
            }
        }

        if (!$settings) {
            $settings = new \App\Models\Setting();
        }
        $settings->fill($request->all());
        $settings->save();

        return redirect()->back();
    }

    /**
     * Periodically check active leads and send follow-ups for 1-hour inactivity.
     */
    public function checkFollowUps()
    {
        $thresholdMinutes = request()->has('debug') ? 2 : 60; // 2 minutes for debug, 60 minutes for production
        $leads = Lead::where('followup_sent', false)
            ->whereIn('status', ['New Lead', 'Cold', 'Warm', 'Hot'])
            ->get();

        $sentCount = 0;
        $now = \Carbon\Carbon::now();

        foreach ($leads as $lead) {
            $lastMessage = Conversation::where('lead_id', $lead->id)
                ->orderBy('created_at', 'desc')
                ->first();

            // If the last message was sent by the AI assistant (waiting on customer reply)
            if ($lastMessage && $lastMessage->sender === 'ai') {
                // Fetch the second to last message in the conversation
                $secondLastMessage = Conversation::where('lead_id', $lead->id)
                    ->orderBy('created_at', 'desc')
                    ->skip(1)
                    ->first();

                // Only send a follow-up if the second-to-last message was from the user (ensures exactly 1 follow-up)
                if ($secondLastMessage && $secondLastMessage->sender === 'user') {
                    $lastActivity = \Carbon\Carbon::parse($lastMessage->created_at);
                    $diffInMinutes = $lastActivity->diffInMinutes($now);

                    if ($diffInMinutes >= $thresholdMinutes) {
                        $chatHistory = Conversation::where('lead_id', $lead->id)
                            ->orderBy('created_at', 'asc')
                            ->get()
                            ->toArray();

                        $settings = \App\Models\Setting::first();
                        $gymName = $settings->gym_name ?? 'Loyal Fitness';

                        // Generate a natural, contextual follow-up message using OpenAI/Gemini
                        $prompt = "Kamu adalah AI Membership Assistant untuk gym {$gymName}.\n\n"
                                . "Konteks:\n"
                                . "Calon member bernama " . ($lead->name ?: 'Kakak') . " ini belum membalas chat terakhir dari Anda selama 1 jam.\n\n"
                                . "Tugas Anda:\n"
                                . "Buatlah satu pesan follow-up singkat, santai, dan sangat ramah (maksimal 1-2 kalimat) untuk menyapa mereka kembali secara halus. Tanyakan kelanjutan rencana latihan mereka di {$gymName} secara ramah.\n"
                                . "JANGAN GUNAKAN FORMAT LINK MARKDOWN ATAU TANDA KURUNG. Tulis teks chat biasa.\n"
                                . "Gunakan maksimal 1 emoji ramah saja (misal: 😊). Jangan menggunakan kata-kata dummy atau template kaku.\n"
                                . "Contoh: 'Halo kak, gimana kemarin jadinya untuk rencana latihan di {$gymName}? Ada yang masih kakak bingungkan? 😊'";

                        $followUpText = \App\Services\AiService::generateResponse($prompt, $chatHistory);

                        if (!empty($followUpText)) {
                            Conversation::create([
                                'lead_id' => $lead->id,
                                'sender' => 'ai',
                                'message' => $followUpText,
                            ]);

                            $lead->followup_sent = true;
                            $lead->save();

                            $this->sendOutgoingMessage($lead->phone, $followUpText);
                            $sentCount++;
                        }
                    }
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'sent_count' => $sentCount
        ]);
    }

    /**
     * Send outgoing WhatsApp messages through the appropriate gateway.
     */
    private function sendOutgoingMessage($phone, $messageText)
    {
        // 1. Try sending via Fonnte if token is set
        $token = env('FONNTE_TOKEN');
        if (!empty($token)) {
            \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $phone,
                'message' => $messageText,
            ]);
            return;
        }

        // 2. Fallback: Send to local Baileys gateway listening on port 3000
        try {
            \Illuminate\Support\Facades\Http::post('http://localhost:3000/api/send', [
                'phone' => $phone,
                'message' => $messageText,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send follow-up via local Baileys gateway: " . $e->getMessage());
        }
    }

    /**
     * Run whats-update.sh system update from the dashboard.
     */
    public function runSystemUpdate()
    {
        try {
            $scriptPath = base_path('whats-update.sh');
            if (!file_exists($scriptPath)) {
                return response()->json([
                    'success' => false,
                    'output' => "Error: whats-update.sh not found at " . $scriptPath
                ], 404);
            }

            // Run the script and capture output
            $output = shell_exec("bash " . escapeshellarg($scriptPath) . " 2>&1");

            return response()->json([
                'success' => true,
                'output' => $output
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'output' => "Exception: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all conversation messages for a lead.
     */
    public function resetLeadChat($leadId)
    {
        try {
            \App\Models\Conversation::where('lead_id', $leadId)->delete();
            
            // Reset lead status back to new and clear follow-up state
            $lead = \App\Models\Lead::find($leadId);
            if ($lead) {
                $lead->status = 'new';
                $lead->followup_sent = false;
                $lead->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Riwayat chat lead berhasil di-reset.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mereset chat: ' . $e->getMessage()
            ], 500);
        }
    }
}
