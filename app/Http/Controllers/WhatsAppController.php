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
        if (!$this->verifyWebhookSecret($request)) {
            return response()->json(['error' => 'Unauthorized gateway request'], 401);
        }

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

        return response()->json(['success' => true]);
    }

    /**
     * Get QR Code for OpenWA Gateway pairing.
     */
    public function getOpenWaQrCode()
    {
        return response()->json(\App\Services\OpenWaService::getQrCode());
    }

    /**
     * Get 8-digit phone pairing code for OpenWA Gateway.
     */
    public function getOpenWaPairingCode(Request $request)
    {
        $res = \App\Services\OpenWaService::getPairingCode($request->phone);
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Kode pairing berhasil dibuat.')->with('code', $res['code'] ?? null);
        }
        return response()->json($res);
    }

    /**
     * Start / Pair OpenWA session.
     */
    public function pairOpenWaSession(Request $request)
    {
        $res = \App\Services\OpenWaService::startSession();
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Sesi WhatsApp berhasil dihubungkan.');
        }
        return response()->json($res);
    }

    /**
     * Unpair / Disconnect OpenWA session.
     */
    public function unpairOpenWaSession(Request $request)
    {
        $res = \App\Services\OpenWaService::stopSession();
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Perangkat WhatsApp berhasil diputus (unpaired).');
        }
        return response()->json($res);
    }

    /**
     * Get OpenWA Gateway health and status information.
     */
    public function getOpenWaStatus()
    {
        $status = \App\Services\OpenWaService::getStatus();
        return response()->json($status);
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

        $responseData = [
            'success' => true,
            'lead' => $result['lead']->load('assignedUser'),
            'conversations' => Conversation::where('lead_id', $result['lead']->id)->orderBy('created_at', 'asc')->get()
        ];
        if (isset($result['list'])) {
            $responseData['list'] = $result['list'];
        }
        if (isset($result['buttons'])) {
            $responseData['buttons'] = $result['buttons'];
        }

        return response()->json($responseData);
    }

    private function verifyWebhookSecret(Request $request): bool
    {
        $secret = env('WHATSAPP_WEBHOOK_SECRET');
        if (empty($secret)) {
            return true;
        }
        $incomingSecret = $request->header('X-Gateway-Secret') ?? $request->input('secret');
        return !empty($incomingSecret) && hash_equals($secret, (string) $incomingSecret);
    }

    /**
     * Real Production WhatsApp Webhook (Supports OpenWA & Gateway REST integrations).
     * Excluded from CSRF validation in bootstrap/app.php.
     */
    public function handleWebhook(Request $request)
    {
        if (!$this->verifyWebhookSecret($request)) {
            return response()->json(['error' => 'Unauthorized webhook request'], 401);
        }

        // 1. Detect OpenWA Event Payloads
        $event = $request->input('event') ?? $request->input('type');
        $data = $request->input('data') ?? $request->all();

        // Handle outgoing manual message event from OpenWA (triggers 10-minute Auto-Mute)
        $isFromMe = $data['fromMe'] ?? $data['key']['fromMe'] ?? false;
        if ($isFromMe || $event === 'message.sent') {
            $senderJid = $data['from'] ?? $data['to'] ?? $data['sender'] ?? '';
            $phone = preg_replace('/[^0-9]/', '', $senderJid);
            if (!empty($phone)) {
                $this->handleManualActivity(new Request(['phone' => $phone]));
            }
            return response()->json(['status' => 'ignored', 'reason' => 'outgoing_manual_message']);
        }

        // Extract sender and message text
        $phone = $request->input('sender') 
                 ?? $data['from'] 
                 ?? $data['author'] 
                 ?? '';
        
        $messageText = $request->input('message') 
                      ?? $data['body'] 
                      ?? $data['text'] 
                      ?? '';
        
        // Normalize phone number (strip @s.whatsapp.net / @lid)
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (empty($phone) || empty($messageText)) {
            return response()->json(['status' => 'error', 'message' => 'Missing sender/message parameter'], 400);
        }

        \Illuminate\Support\Facades\Log::info("📨 [WhatsApp Webhook] Incoming message from {$phone}: '{$messageText}'");

        // Process chat and generate AI response
        $result = $this->processIncomingMessage($phone, $messageText, null);
        $aiResponse = $result['ai_response'] ?? null;

        // Return AI response in JSON payload for gateway.js to send after typing delay simulation
        $responseData = [
            'status' => 'success',
            'ai_response' => $aiResponse
        ];
        if (isset($result['list'])) {
            $responseData['list'] = $result['list'];
        }
        if (isset($result['buttons'])) {
            $responseData['buttons'] = $result['buttons'];
        }

        return response()->json($responseData);
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

        $lowerMsg = strtolower(trim($messageText));
        if ($lowerMsg === 'mc_1' || $lowerMsg === 'mc_2' || $lowerMsg === 'mc_3' || $lowerMsg === 'mc_4' || $lowerMsg === 'mc_5') {
            $mcMapping = [
                'mc_1' => '62895604631765',
                'mc_2' => '6285367394199',
                'mc_3' => '6281314420857',
                'mc_4' => '6281929924446',
                'mc_5' => '6282160149532'
            ];
            $mcPhone = $mcMapping[$lowerMsg];
            $mcUser = \App\Models\User::where('phone', $mcPhone)->first();
            $mcName = $mcUser ? $mcUser->name : 'Membership Consultant';

            // Check if there is a pending handover
            $handover = Handover::where('lead_id', $lead->id)
                ->where('status', 'pending')
                ->first();

            // Assign lead to this MC
            $lead->assigned_to = $mcUser ? $mcUser->id : null;
            $lead->status = 'Handover to CS';
            $lead->save();

            if ($handover) {
                $handover->assigned_to = $mcUser ? $mcUser->id : null;
                $handover->status = 'resolved';
                $handover->save();
            } else {
                Handover::create([
                    'lead_id' => $lead->id,
                    'summary' => "Calon member (" . ($lead->name ?: 'Customer') . ") tertarik mendaftar. Minat: " . ($lead->interest ?: 'Belum ditentukan') . ", Target latihan: " . ($lead->goal ?: 'Kesehatan') . ", Domisili: " . ($lead->location ?: 'Palembang') . ". Skor leads: " . $lead->lead_score . "%",
                    'reason' => 'Direct MC selection via button',
                    'assigned_to' => $mcUser ? $mcUser->id : null,
                    'status' => 'resolved'
                ]);
            }

            // Save user selection to chat history
            Conversation::create([
                'lead_id' => $lead->id,
                'sender' => 'user',
                'message' => "Memilih MC: " . $mcName
            ]);

            // Notify the MC!
            $summary = "Calon member (" . ($lead->name ?: 'Customer') . ") tertarik mendaftar.\n- Minat: " . ($lead->interest ?: 'Belum ditentukan') . "\n- Target latihan: " . ($lead->goal ?: 'Kesehatan') . "\n- Domisili: " . ($lead->location ?: 'Palembang') . "\n- Skor leads: " . $lead->lead_score . "%";
            $mcNotifyMessage = "🔔 *NOTIFIKASI LEAD BARU (ROLLOVER)* 🔔\n\nAda lead baru yang memilih Anda sebagai MC!\n\n*Detail Lead:*\n- *Nama:* " . ($lead->name ?: 'Calon Member') . "\n- *No. WA:* " . $lead->phone . "\n- *Goals:* " . ($lead->goal ?: '-') . "\n- *Minat:* " . ($lead->interest ?: '-') . "\n\n*Summary Percakapan:*\n" . $summary . "\n\nSilakan hubungi calon member ini segera ya! 🚀";
            $this->sendOutgoingMessage($mcPhone, $mcNotifyMessage);

            // AI Response back to customer
            $aiResponse = "Terima kasih banyak kak! Kakak telah memilih *" . $mcName . "* untuk membantu Kakak. Beliau akan segera menghubungi Kakak via WhatsApp ini ya kak! Sampai jumpa di gym! 😊";
            
            Conversation::create([
                'lead_id' => $lead->id,
                'sender' => 'ai',
                'message' => $aiResponse
            ]);

            return [
                'lead' => $lead,
                'ai_response' => $aiResponse
            ];
        }

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
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        $isMutedByCache = \Illuminate\Support\Facades\Cache::has("whatsapp_mute_ai_{$cleanPhone}");

        if (($lead->lead_score >= 70 || $hasClosingKeyword) && !$isHumanManaged && !$isMutedByCache) {
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
            $aiResponse = "Siap kak, sepertinya kakak sudah cocok ya. Silakan pilih salah satu *Membership Consultant (MC)* kami di bawah ini untuk membantu proses pendaftaran, penawaran harga terbaik, dan visit Kakak:\n\n"
                        . "1. *Popi* (https://wa.me/62895604631765)\n"
                        . "2. *Ayu* (https://wa.me/6285367394199)\n"
                        . "3. *Indah* (https://wa.me/6281314420857)\n"
                        . "4. *Lenny* (https://wa.me/6281929924446)\n"
                        . "5. *Mesi Lenny* (https://wa.me/6282160149532)\n\n"
                        . "Atau Kakak juga bisa klik tombol *'Pilih Consultant'* di bawah ini ya kak! 👇";

            // Save AI reply
            Conversation::create([
                'lead_id' => $lead->id,
                'sender' => 'ai',
                'message' => $aiResponse,
            ]);

            $list = [
                'title' => 'Pilih Consultant',
                'buttonText' => 'Pilih Consultant',
                'sections' => [
                    [
                        'title' => 'Membership Consultant',
                        'rows' => [
                            ['title' => 'Popi', 'rowId' => 'mc_1', 'description' => '0895-6046-31765'],
                            ['title' => 'Ayu', 'rowId' => 'mc_2', 'description' => '0853-6739-4199'],
                            ['title' => 'Indah', 'rowId' => 'mc_3', 'description' => '0813-1442-0857'],
                            ['title' => 'Lenny', 'rowId' => 'mc_4', 'description' => '0819-2992-4446'],
                            ['title' => 'Mesi Lenny', 'rowId' => 'mc_5', 'description' => '0821-6014-9532']
                        ]
                    ]
                ]
            ];

            return [
                'lead' => $lead,
                'ai_response' => $aiResponse,
                'list' => $list
            ];
        } elseif ($isHumanManaged || $isMutedByCache) {
            $reasonText = $isHumanManaged 
                ? "Status Handover CS ({$lead->status})" 
                : "Aktivitas CS Manual di HP (Mute 30 Menit)";
            
            \Illuminate\Support\Facades\Log::warning("🛑 [WhatsApp AI] Auto-Reply muted for {$phone}. Reason: {$reasonText}.");
            
            // Record to HeldMessageLog database table
            \App\Models\HeldMessageLog::create([
                'lead_id' => $lead->id,
                'phone' => $cleanPhone,
                'customer_name' => $lead->name ?: 'Calon Member',
                'message' => $messageText,
                'reason' => $reasonText,
                'status' => 'held',
                'muted_until' => $isMutedByCache ? now()->addMinutes(30) : null,
            ]);

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
            $instagramUrl = $settings->instagram_url ?? 'https://www.instagram.com/loyalfitnessindonesia';
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
                    . "Biaya Personal Trainer (PT): Mulai dari Rp 1.500.000 untuk 10 kali latihan.\n\n"
                    . "INFO LOYAL FITNESS PRIME PALEMBANG SQUARE:\n"
                    . "- Cabang baru di dalam mall Palembang Square dengan konsep lebih premium, lengkap, dan buka 24 jam.\n"
                    . "- Saat ini dalam masa presales dengan harga khusus yang lebih murah.\n"
                    . "- Estimasi selesai/opening paling lambat 1 Oktober 2026 (bisa lebih cepat).\n"
                    . "- Panduan Gaya Menjawab Khusus Palembang Square:\n"
                    . "  * Info Umum: \"Betul kak, Loyal Fitness Prime akan hadir di Palembang Square. Konsepnya 24 jam, lokasinya di dalam mall, fasilitasnya lebih lengkap dan lebih premium dari Loyal Fitness IP. Saat ini masih masa presales, jadi harga lebih murah dibanding nanti saat sudah opening. Untuk estimasi selesai paling lama 1 Oktober 2026, tapi bisa saja lebih cepat kalau proses persiapan selesai lebih awal.\"\n"
                    . "  * Fasilitas: \"Fasilitasnya akan dibuat lebih lengkap kak, seperti gym area, studio class, private area, sauna, VIP room, healthy cafe, dan konsep 24 jam. Jadi member bisa latihan lebih fleksibel dan nyaman.\"\n"
                    . "  * Harga: \"Untuk harga presales sedang dibuka dengan harga khusus kak, lebih murah dari harga normal saat opening nanti. Biar saya bantu cek promo yang paling cocok ya kak, kakak rencana ambil membership sendiri atau bareng teman/keluarga?\"\n"
                    . "  * Kapan Buka: \"Target paling lama 1 Oktober 2026 kak. Tapi kalau pengerjaan selesai lebih cepat, kemungkinan opening juga bisa lebih cepat.\"\n"
                    . "  * Perbandingan dengan Loyal Fitness IP: \"Loyal Fitness Prime Palembang Square akan dibuat lebih lengkap dan lebih premium dari Loyal Fitness IP kak, karena konsepnya memang upgrade: 24 jam, fasilitas lebih lengkap, dan lokasi di mall yang strategis.\"\n"
                    . "  * Closing Lembut: \"Karena masih presales, biasanya kuota harga murah terbatas kak. Saya bantu amankan harga presales dulu ya, supaya kakak tidak kena harga normal saat opening.\"";


            // Fetch chat history
            $chatHistory = Conversation::where('lead_id', $lead->id)
                ->orderBy('created_at', 'asc')
                ->get()
                ->toArray();

            $aiResponse = AiService::generateResponse($prompt, $chatHistory);
            \Illuminate\Support\Facades\Log::info("🤖 [WhatsApp AI] Auto-Reply generated for {$phone}: '{$aiResponse}'");
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
            $output = \shell_exec("bash " . escapeshellarg($scriptPath) . " 2>&1");

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
     * Handle manual messaging or reading activity from the Baileys gateway to mute the AI.
     */
    public function handleManualActivity(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $phone = $request->phone;
        // Normalize phone number (keep digits only)
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Cache mute state for 30 minutes (debounce timer)
        \Illuminate\Support\Facades\Cache::put("whatsapp_mute_ai_{$phone}", true, now()->addMinutes(30));
        \Illuminate\Support\Facades\Log::info("👤 [WhatsApp CS] Manual CS activity detected on HP for {$phone}. AI Muted for 30 minutes.");

        // Update Lead status to Handover to CS so agents know it is under manual handling
        $lead = Lead::where('phone', $phone)->first();
        if ($lead && !in_array($lead->status, ['Handover to CS', 'Visit Scheduled', 'Closed Won', 'Closed Lost'])) {
            $lead->status = 'Handover to CS';
            $lead->save();

            // Create Handover record if it doesn't exist
            $exists = Handover::where('lead_id', $lead->id)->where('status', 'pending')->exists();
            if (!$exists) {
                Handover::create([
                    'lead_id' => $lead->id,
                    'summary' => "Agen merespon secara manual dari HP/perangkat terhubung.",
                    'reason' => 'Manual human activity detected',
                    'status' => 'pending'
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'AI muted for phone ' . $phone . ' for 30 minutes',
            'muted_until' => now()->addMinutes(30)->toDateTimeString()
        ]);
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

                // Clear AI mute cache
                \Illuminate\Support\Facades\Cache::forget("whatsapp_mute_ai_{$lead->phone}");
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

    /**
     * Check if a specific phone number is muted from AI auto-reply.
     */
    public function checkMuteStatus(Request $request)
    {
        $phone = preg_replace('/[^0-9]/', '', $request->phone ?? '');
        $isMuted = \Illuminate\Support\Facades\Cache::has("whatsapp_mute_ai_{$phone}");
        
        $lead = Lead::where('phone', $phone)->first();
        if ($lead && in_array($lead->status, ['Handover to CS', 'Visit Scheduled', 'Closed Won', 'Closed Lost'])) {
            $isMuted = true;
        }

        return response()->json([
            'phone' => $phone,
            'is_muted' => $isMuted
        ]);
    }
}
