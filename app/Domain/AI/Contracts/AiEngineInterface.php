<?php

namespace App\Domain\AI\Contracts;

interface AiEngineInterface
{
    /**
     * Generate response given prompt instructions and conversation history array.
     *
     * @param string $prompt
     * @param array $conversationHistory
     * @return string
     */
    public static function generateResponse(string $prompt, array $conversationHistory = []): string;
}
