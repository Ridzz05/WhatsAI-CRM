<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenWaService
{
    /**
     * Send text message via OpenWA Gateway REST API.
     */
    public static function sendMessage($phone, $message, $sessionId = null)
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

        // 1. Try local Baileys Gateway Server (Port 3000) if active
        try {
            $baileysRes = Http::withoutVerifying()->timeout(8)->post('http://localhost:3000/api/send', [
                'phone' => $cleanPhone,
                'message' => $message,
            ]);

            if ($baileysRes->successful()) {
                Log::info("Baileys message sent to {$cleanPhone}");
                return [
                    'success' => true,
                    'data' => $baileysRes->json()
                ];
            }
        } catch (\Exception $e) {
            // Ignore if port 3000 is offline
        }

        // 2. Try OpenWA REST Server (Port 2785)
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $uuid = $sessionId ?? self::getDefaultSessionUuid() ?? 'default';
        $chatId = str_contains($cleanPhone, '@') ? $cleanPhone : "{$cleanPhone}@s.whatsapp.net";

        try {
            $client = Http::withoutVerifying()->timeout(10);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            // Post to OpenWA sessions message send endpoint
            $response = $client->post("{$baseUrl}/api/sessions/{$uuid}/messages/send-text", [
                'chatId' => $chatId,
                'text' => $message,
            ]);

            if ($response->successful()) {
                Log::info("OpenWA message sent to {$cleanPhone}");
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error("OpenWA Send Error: " . $response->body());
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'Failed to connect')) {
                Log::error("OpenWA Connection Error: " . $e->getMessage());
            }
        }

        return [
            'success' => false,
            'message' => 'Failed to deliver message via WhatsApp Gateway'
        ];
    }

    /**
     * Send media message (image/document) via OpenWA Gateway REST API.
     */
    public static function sendMedia($phone, $caption, $mediaPath, $sessionId = null)
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        $uuid = $sessionId ?? self::getDefaultSessionUuid() ?? 'default';
        $chatId = str_contains($cleanPhone, '@') ? $cleanPhone : "{$cleanPhone}@s.whatsapp.net";

        try {
            $client = Http::withoutVerifying()->timeout(15);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            if (file_exists($mediaPath)) {
                $mime = mime_content_type($mediaPath);
                $isImage = str_starts_with($mime, 'image/');
                $endpoint = $isImage ? "send-image" : "send-file";

                $response = $client->attach('file', file_get_contents($mediaPath), basename($mediaPath))
                    ->post("{$baseUrl}/api/sessions/{$uuid}/messages/{$endpoint}", [
                        'chatId' => $chatId,
                        'caption' => $caption,
                    ]);

                if ($response->successful()) {
                    Log::info("OpenWA media sent to {$cleanPhone}");
                    return ['success' => true, 'data' => $response->json()];
                }
            }
        } catch (\Exception $e) {
            Log::error("OpenWA Media Send Error: " . $e->getMessage());
        }

        // Fallback to text message if media send fails
        return self::sendMessage($phone, $caption, $sessionId);
    }

    /**
     * Get OpenWA Session Health / Status
     */
    public static function getStatus()
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');

        try {
            $client = Http::withoutVerifying()->timeout(5);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            // 1. Health check to see if OpenWA server process is running
            $healthRes = $client->get("{$baseUrl}/api/health");
            if (!$healthRes->successful()) {
                return [
                    'status' => 'OFFLINE',
                    'connected' => false,
                    'phone' => null,
                    'pushName' => null
                ];
            }

            // 2. Fetch active sessions list to verify actual WhatsApp connection & phone number
            $sessionsRes = $client->get("{$baseUrl}/api/sessions");
            $sessions = $sessionsRes->successful() ? $sessionsRes->json() : [];
            $sessionData = (!empty($sessions) && is_array($sessions)) ? $sessions[0] : null;

            $rawPhone = $sessionData['phone'] ?? env('WA_PHONE_NUMBER', null);
            $pushName = $sessionData['pushName'] ?? 'Loyal Fitness AI Assistant';
            $sessionStatus = $sessionData['status'] ?? 'created';

            $formattedPhone = null;
            if (!empty($rawPhone)) {
                $cleanDigits = preg_replace('/[^0-9]/', '', $rawPhone);
                $formattedPhone = '+' . $cleanDigits;
            }

            $isUnpairedCache = \Illuminate\Support\Facades\Cache::get('openwa_session_unpaired', false);
            if (empty($sessions) || $isUnpairedCache) {
                return [
                    'status' => 'UNPAIRED',
                    'connected' => false,
                    'phone' => null,
                    'pushName' => $pushName,
                    'sessionStatus' => $sessionStatus
                ];
            }

            $data = $healthRes->json();
            $data['connected'] = true;
            $data['phone'] = $formattedPhone;
            $data['pushName'] = $pushName;
            $data['sessionStatus'] = $sessionStatus;
            return $data;
        } catch (\Exception $e) {
            // Ignore connection errors
        }

        // Fallback: Check if Baileys gateway (gateway.js) is connected
        $gatewayStatus = \Illuminate\Support\Facades\Cache::get('whatsapp_gateway_status');
        if ($gatewayStatus === 'connected') {
            return [
                'status' => 'ONLINE',
                'connected' => true,
                'phone' => 'Terhubung via Baileys Engine',
                'pushName' => 'Loyal Fitness AI Assistant',
                'sessionStatus' => 'ready'
            ];
        }

        return [
            'status' => 'OFFLINE',
            'connected' => false,
            'phone' => null,
            'pushName' => null
        ];
    }

    /**
     * Send WhatsApp Story / Status update via OpenWA Gateway
     */
    public static function sendStatus($text, $bgColor = '#075e54', $sessionId = null)
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $uuid = $sessionId ?? self::getDefaultSessionUuid() ?? 'default';

        try {
            $client = Http::withoutVerifying()->timeout(10);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            $response = $client->post("{$baseUrl}/api/sessions/{$uuid}/status/send-text", [
                'text' => $text,
                'backgroundColor' => $bgColor
            ]);

            if ($response->successful()) {
                Log::info("OpenWA Status Story posted successfully");
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error("OpenWA Status Post Error: " . $response->body());
        } catch (\Exception $e) {
            Log::error("OpenWA Connection Error: " . $e->getMessage());
        }

        return [
            'success' => false,
            'message' => 'Failed to post status via OpenWA Gateway'
        ];
    }

    /**
     * Resolve default Session UUID from OpenWA REST Gateway or create one if none exists.
     */
    public static function getDefaultSessionUuid()
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');

        try {
            $client = Http::withoutVerifying()->timeout(5);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            // 1. Check existing sessions
            $res = $client->get("{$baseUrl}/api/sessions");
            if ($res->successful()) {
                $sessions = $res->json();
                if (!empty($sessions) && is_array($sessions) && isset($sessions[0]['id'])) {
                    return $sessions[0]['id'];
                }
            }

            // 2. If no session exists, create a default session
            $createRes = $client->post("{$baseUrl}/api/sessions", [
                'name' => 'default'
            ]);
            if ($createRes->successful() && isset($createRes->json()['id'])) {
                return $createRes->json()['id'];
            }
        } catch (\Exception $e) {
            // Silently return null when OpenWA server is offline or unreachable
            if (!str_contains($e->getMessage(), 'Failed to connect')) {
                Log::warning("OpenWA Resolve Session UUID: " . $e->getMessage());
            }
        }

        return null;
    }

    /**
     * Format raw QR text string into a clean 300x300 PNG image URL for HTML <img> tag.
     */
    private static function formatQrImageUrl($rawQr)
    {
        if (empty($rawQr)) return null;

        // If it is already a base64 image Data URI or direct qrserver image URL, use as-is
        if (str_starts_with($rawQr, 'data:image/') || str_contains($rawQr, 'api.qrserver.com')) {
            return $rawQr;
        }

        // Convert raw string (e.g. 2@AbCd... or https://wa.me/settings/linked_devices#2@...) into PNG QR image
        return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($rawQr);
    }

    /**
     * Get QR Code for WhatsApp Session Pairing
     */
    public static function getQrCode($sessionId = null)
    {
        // 1. Check if Baileys gateway (gateway.js) broadcasted a QR or status via /api/whatsapp/status
        $gatewayStatus = \Illuminate\Support\Facades\Cache::get('whatsapp_gateway_status');
        if ($gatewayStatus === 'connected') {
            return [
                'success' => true,
                'authenticated' => true,
                'message' => 'WhatsApp Gateway is connected and authenticated'
            ];
        }

        $cachedQr = \Illuminate\Support\Facades\Cache::get('whatsapp_gateway_qr');
        if (!empty($cachedQr)) {
            $qrImg = self::formatQrImageUrl($cachedQr);

            return [
                'success' => true,
                'authenticated' => false,
                'qr' => $qrImg,
                'rawQr' => $cachedQr,
                'source' => 'baileys_gateway'
            ];
        }

        // 1.5 Try direct query to local Baileys gateway server (Port 3000)
        try {
            $baileysRes = Http::withoutVerifying()->timeout(3)->get('http://localhost:3000/qr');
            if ($baileysRes->successful()) {
                $bData = $baileysRes->json();
                if (!empty($bData['authenticated'])) {
                    return [
                        'success' => true,
                        'authenticated' => true,
                        'message' => 'WhatsApp Gateway is connected and authenticated'
                    ];
                }
                if (!empty($bData['qr'])) {
                    $rawQr = $bData['qr'];
                    $qrImg = self::formatQrImageUrl($rawQr);

                    return [
                        'success' => true,
                        'authenticated' => false,
                        'qr' => $qrImg,
                        'rawQr' => $rawQr,
                        'source' => 'baileys_gateway_direct'
                    ];
                }
            }
        } catch (\Exception $e) {
            // Ignore if port 3000 is not running
        }

        // 2. Try OpenWA REST Server (Port 2785)
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $uuid = $sessionId ?? self::getDefaultSessionUuid();

        if (!empty($uuid)) {
            try {
                $client = Http::withoutVerifying()->timeout(5);
                if (!empty($apiKey)) {
                    $client = $client->withHeaders(['X-API-Key' => $apiKey]);
                }

                // Ensure session is started first
                $startRes = $client->post("{$baseUrl}/api/sessions/{$uuid}/start");

                $response = $client->get("{$baseUrl}/api/sessions/{$uuid}/qr");
                if ($response->successful()) {
                    $json = $response->json();
                    $rawQr = null;
                    if (is_array($json)) {
                        $rawQr = $json['qrCode'] ?? $json['qr'] ?? $json['code'] ?? null;
                    }

                    if (empty($rawQr) && is_string($response->body())) {
                        $body = trim($response->body());
                        if (str_starts_with($body, 'data:') || str_starts_with($body, 'http')) {
                            $rawQr = $body;
                        }
                    }

                    if (!empty($rawQr)) {
                        $qrImg = self::formatQrImageUrl($rawQr);

                        return [
                            'success' => true,
                            'authenticated' => false,
                            'qr' => $qrImg,
                            'rawQr' => $rawQr,
                            'data' => $json
                        ];
                    }
                } else {
                    $msg = strtolower($response->json()['message'] ?? '');
                    if (str_contains($msg, 'authenticated') || str_contains($msg, 'ready')) {
                        $sessionDetails = $client->get("{$baseUrl}/api/sessions/{$uuid}");
                        if ($sessionDetails->successful() && ($sessionDetails->json()['status'] ?? '') === 'ready' && !empty($sessionDetails->json()['phone'])) {
                            \Illuminate\Support\Facades\Cache::forget('openwa_session_unpaired');
                            return [
                                'success' => true,
                                'authenticated' => true,
                                'message' => 'Session already authenticated'
                            ];
                        }
                    }
                }
            } catch (\Exception $e) {
                // Ignore connection error to OpenWA REST server
            }
        }

        return [
            'success' => false,
            'authenticated' => false,
            'message' => 'Failed to fetch QR Code from WhatsApp Gateway'
        ];
    }

    /**
     * Get 8-Digit Pairing Code for Phone Pairing
     */
    public static function getPairingCode($phone, $sessionId = null)
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        $uuid = $sessionId ?? self::getDefaultSessionUuid();

        if (empty($uuid)) {
            return [
                'success' => false,
                'message' => 'No session UUID available from OpenWA'
            ];
        }

        try {
            $client = Http::withoutVerifying()->timeout(10);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            // Ensure session is started
            $client->post("{$baseUrl}/api/sessions/{$uuid}/start");

            $response = $client->post("{$baseUrl}/api/sessions/{$uuid}/pairing-code", [
                'phoneNumber' => $cleanPhone
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'code' => $response->json()['code'] ?? $response->json()['pairingCode'] ?? null,
                    'data' => $response->json()
                ];
            }
        } catch (\Exception $e) {
            Log::error("OpenWA Pairing Code Error: " . $e->getMessage());
        }

        return [
            'success' => false,
            'message' => 'Failed to generate Pairing Code'
        ];
    }

    /**
     * Start WhatsApp Session
     */
    public static function startSession($sessionId = null)
    {
        // Clear unpaired cache state when starting/pairing session
        \Illuminate\Support\Facades\Cache::forget('openwa_session_unpaired');
        \Illuminate\Support\Facades\Cache::put('whatsapp_gateway_status', 'disconnected');

        // Trigger local Baileys gateway (port 3000) to re-initialize fresh pairing socket
        try {
            Http::withoutVerifying()->timeout(3)->get('http://localhost:3000/pair');
        } catch (\Exception $e) {
            // Ignore if port 3000 is not running
        }

        // Fetch or create fresh default session for OpenWA REST
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $uuid = self::getDefaultSessionUuid();

        if (empty($uuid)) {
            return ['success' => true, 'message' => 'Baileys local gateway pairing triggered'];
        }

        try {
            $client = Http::withoutVerifying()->timeout(10);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            $response = $client->post("{$baseUrl}/api/sessions/{$uuid}/start");
            return [
                'success' => true,
                'data' => $response->json()
            ];
        } catch (\Exception $e) {
            return ['success' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * Stop / Disconnect / Unpair WhatsApp Session
     */
    public static function stopSession($sessionId = null)
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $uuid = $sessionId ?? self::getDefaultSessionUuid();

        // Set unpaired cache state and reset connection status
        \Illuminate\Support\Facades\Cache::put('openwa_session_unpaired', true);
        \Illuminate\Support\Facades\Cache::put('whatsapp_gateway_status', 'disconnected');
        \Illuminate\Support\Facades\Cache::forget('whatsapp_gateway_qr');

        if (!empty($uuid)) {
            try {
                $client = Http::withoutVerifying()->timeout(10);
                if (!empty($apiKey)) {
                    $client = $client->withHeaders(['X-API-Key' => $apiKey]);
                }

                // Force kill and delete session completely from OpenWA REST server
                $client->post("{$baseUrl}/api/sessions/{$uuid}/stop");
                $client->post("{$baseUrl}/api/sessions/{$uuid}/force-kill");
                $client->delete("{$baseUrl}/api/sessions/{$uuid}");
            } catch (\Exception $e) {
                // Ignore connection errors during stop
            }
        }

        return [
            'success' => true,
            'message' => 'Session disconnected and unpaired successfully'
        ];
    }
}
