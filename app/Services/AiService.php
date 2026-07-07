<?php

namespace App\Services;

class AiService
{
    /**
     * Coordinate AI requests: tries OpenAI first, then Gemini, and falls back to rule-based NLP if no keys are defined.
     */
    public static function generateResponse($prompt, $conversationHistory = [])
    {
        // 1. Try OpenAI if OPENAI_API_KEY is configured
        if (!empty(env('OPENAI_API_KEY'))) {
            $openAiResponse = OpenAiService::generateResponse($prompt, $conversationHistory);
            if ($openAiResponse !== null) {
                return $openAiResponse;
            }
        }

        // 2. Try Gemini if GEMINI_API_KEY is configured
        if (!empty(env('GEMINI_API_KEY'))) {
            return GeminiService::generateResponse($prompt, $conversationHistory);
        }

        // 3. Fallback to highly optimized Local NLP rule-based simulator
        return GeminiService::generateResponse(null, $conversationHistory);
    }
}
