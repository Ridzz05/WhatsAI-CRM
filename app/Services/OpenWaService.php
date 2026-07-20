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

            $response = $client->get("{$baseUrl}/api/health");
            if ($response->successful()) {
                $data = $response->json();
                $data['connected'] = true;
                return $data;
            }
        } catch (\Exception $e) {
            // Ignore connection errors
        }

        return [
            'status' => 'OFFLINE',
            'connected' => false
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
     * Get QR Code for WhatsApp Session Pairing
     */
    public static function getQrCode($sessionId = 'default')
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');

        try {
            $client = Http::withoutVerifying()->timeout(5);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            $response = $client->get("{$baseUrl}/api/sessions/{$sessionId}/qr");
            if ($response->successful()) {
                return [
                    'success' => true,
                    'qr' => $response->json()['qr'] ?? $response->body(),
                    'data' => $response->json()
                ];
            }
        } catch (\Exception $e) {
            Log::error("OpenWA QR Error: " . $e->getMessage());
        }

        return [
            'success' => false,
            'message' => 'Failed to fetch QR Code from OpenWA'
        ];
    }

    /**
     * Get 8-Digit Pairing Code for Phone Pairing
     */
    public static function getPairingCode($phone, $sessionId = 'default')
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

        try {
            $client = Http::withoutVerifying()->timeout(10);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            $response = $client->post("{$baseUrl}/api/sessions/{$sessionId}/pairing-code", [
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
    public static function startSession($sessionId = 'default')
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');

        try {
            $client = Http::withoutVerifying()->timeout(10);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            $response = $client->post("{$baseUrl}/api/sessions/{$sessionId}/start");
            return [
                'success' => $response->successful(),
                'data' => $response->json()
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Stop / Disconnect / Unpair WhatsApp Session
     */
    public static function stopSession($sessionId = 'default')
    {
        $baseUrl = env('OPENWA_BASE_URL', 'http://localhost:2785');
        $apiKey = env('OPENWA_API_KEY', '');

        try {
            $client = Http::withoutVerifying()->timeout(10);
            if (!empty($apiKey)) {
                $client = $client->withHeaders(['X-API-Key' => $apiKey]);
            }

            // Stop session and force kill for clean unpair
            $response = $client->post("{$baseUrl}/api/sessions/{$sessionId}/stop");
            $client->post("{$baseUrl}/api/sessions/{$sessionId}/force-kill");

            return [
                'success' => true,
                'message' => 'Session disconnected and unpaired successfully'
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
