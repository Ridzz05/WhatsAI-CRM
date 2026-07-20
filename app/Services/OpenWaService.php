<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenWaService
{
    /**
     * Send text message via OpenWA Gateway REST API.
     */
    public static function sendMessage($phone, $message)
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        
        // Ensure standard phone number formatting for WhatsApp JID
        $chatId = str_contains($cleanPhone, '@') ? $cleanPhone : "{$cleanPhone}@s.whatsapp.net";

        try {
            $client = Http::withoutVerifying()->timeout(10);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            // Post to OpenWA sessions message send endpoint
            $response = $client->post("{$baseUrl}/api/sessions/default/messages/send-text", [
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
            Log::error("OpenWA Connection Error: " . $e->getMessage());
        }

        return [
            'success' => false,
            'message' => 'Failed to deliver message via OpenWA Gateway'
        ];
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
    public static function sendStatus($text, $bgColor = '#075e54')
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');

        try {
            $client = Http::withoutVerifying()->timeout(10);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            $response = $client->post("{$baseUrl}/api/sessions/default/status/send-text", [
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
            Log::error("OpenWA Resolve Session UUID Error: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Get QR Code for WhatsApp Session Pairing
     */
    public static function getQrCode($sessionId = null)
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $uuid = $sessionId ?? self::getDefaultSessionUuid();

        if (empty($uuid)) {
            return [
                'success' => false,
                'message' => 'No session UUID available from OpenWA'
            ];
        }

        try {
            $client = Http::withoutVerifying()->timeout(5);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            // Ensure session is started first
            $startRes = $client->post("{$baseUrl}/api/sessions/{$uuid}/start");

            $response = $client->get("{$baseUrl}/api/sessions/{$uuid}/qr");
            if ($response->successful()) {
                $rawQr = $response->json()['qr'] ?? $response->json()['qrCode'] ?? $response->json()['code'] ?? $response->body();
                // Build dynamic QR Image URL if raw string
                $qrImg = (str_starts_with($rawQr, 'data:') || str_starts_with($rawQr, 'http'))
                    ? $rawQr
                    : "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" . urlencode($rawQr);

                return [
                    'success' => true,
                    'authenticated' => false,
                    'qr' => $qrImg,
                    'rawQr' => $rawQr,
                    'data' => $response->json()
                ];
            } else {
                $msg = strtolower($response->json()['message'] ?? '');
                if (str_contains($msg, 'authenticated') || str_contains($msg, 'ready') || str_contains($msg, 'already started')) {
                    \Illuminate\Support\Facades\Cache::forget('openwa_session_unpaired');
                    return [
                        'success' => true,
                        'authenticated' => true,
                        'message' => 'Session already authenticated'
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error("OpenWA QR Error: " . $e->getMessage());
        }

        return [
            'success' => false,
            'authenticated' => false,
            'message' => 'Failed to fetch QR Code from OpenWA'
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
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $uuid = $sessionId ?? self::getDefaultSessionUuid();

        // Clear unpaired cache state when starting/pairing session
        \Illuminate\Support\Facades\Cache::forget('openwa_session_unpaired');

        if (empty($uuid)) {
            return ['success' => false, 'message' => 'No session UUID available'];
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

        // Set unpaired cache state when stopping/unpairing session
        \Illuminate\Support\Facades\Cache::put('openwa_session_unpaired', true);

        if (!empty($uuid)) {
            try {
                $client = Http::withoutVerifying()->timeout(10);
                if (!empty($apiKey)) {
                    $client = $client->withHeaders(['X-API-Key' => $apiKey]);
                }

                $client->post("{$baseUrl}/api/sessions/{$uuid}/stop");
                $client->post("{$baseUrl}/api/sessions/{$uuid}/force-kill");
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
