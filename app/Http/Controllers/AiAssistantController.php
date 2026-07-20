<?php

namespace App\Http\Controllers;

use App\Services\OpenAiService;
use Illuminate\Http\Request;

class AiAssistantController extends Controller
{
    /**
     * Polish text using OpenAI gpt-4o / gpt-4o-mini according to requested style.
     */
    public function polish(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'style' => 'required|string' // marketing, formal, santai, profesional, mendesak, ramah, optimalkan
        ]);

        $stylePrompts = [
            'marketing' => 'Ubah teks berikut menjadi gaya copywriting marketing WhatsApp yang sangat menarik, persuasif, menambahkan emoji relevan, dan memiliki Call to Action (CTA) kuat tanpa mengubah maksud asli:',
            'formal' => 'Ubah teks berikut menjadi bahasa Indonesia formal, sopan, dan profesional yang cocok untuk komunikasi resmi bisnis:',
            'santai' => 'Ubah teks berikut menjadi gaya percakapan WhatsApp yang santai, ramah, bersahabat, dan kekinian dengan emoji secukupnya:',
            'profesional' => 'Ubah teks berikut menjadi format pesan bisnis profesional yang ringkas, lugas, dan jelas:',
            'mendesak' => 'Ubah teks berikut menjadi pesan promosi yang memberikan kesan urgensi/kelangkaan (FOMO) secara sopan:',
            'ramah' => 'Ubah teks berikut menjadi sapaan ramah dan hangat yang membuat pelanggan merasa sangat dihargai:',
            'optimalkan' => 'Perbaiki tata bahasa, ejaan, dan kejelasan teks berikut agar tampak rapi di WhatsApp:'
        ];

        $promptInstruction = $stylePrompts[$request->style] ?? $stylePrompts['optimalkan'];
        
        $messages = [
            ['role' => 'system', 'content' => 'Anda adalah asisten copywriter WhatsApp profesional. Tugas Anda adalah memoles teks pengguna sesuai gaya yang diminta. Kembalikan HANYA teks hasil olahan tanpa komentar tambahan.'],
            ['role' => 'user', 'content' => "{$promptInstruction}\n\n\"{$request->text}\""]
        ];

        $polishedText = OpenAiService::generateResponse($messages);

        if (!$polishedText) {
            // Fallback response if OpenAI offline or key error
            $polishedText = $request->text;
        }

        return response()->json([
            'status' => 'success',
            'polished_text' => trim($polishedText, '"')
        ]);
    }
}
