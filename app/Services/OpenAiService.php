<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiService
{
    /**
     * Generate response from OpenAI Chat Completions API.
     */
    public static function generateResponse($prompt, $conversationHistory = [])
    {
        $apiKey = env('OPENAI_API_KEY');
        if (empty($apiKey)) {
            return null;
        }

        $messages = [];
        // Add System prompt instruction
        $messages[] = [
            'role' => 'system',
            'content' => $prompt
        ];

        // Format history for OpenAI
        foreach ($conversationHistory as $chat) {
            $messages[] = [
                'role' => $chat['sender'] === 'user' ? 'user' : 'assistant',
                'content' => $chat['message']
            ];
        }

        try {
            // Using standard Laravel HTTP client to call OpenAI API with SSL verification disabled for local dev compatibility
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o', // Flagship model for high accuracy and cost-efficiency
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 400,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            }

            Log::error("OpenAI API Error: " . $response->body());
        } catch (\Exception $e) {
            Log::error("OpenAI Connection Error: " . $e->getMessage());
        }

        return null;
    }
}
