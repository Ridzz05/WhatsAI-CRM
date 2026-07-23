<?php

namespace App\Domain\Leads\Actions;

use App\Models\Lead;

class ScoreLeadAction
{
    /**
     * Calculate and update lead score based on incoming chat keywords.
     */
    public function execute(Lead $lead, string $message): int
    {
        $text = strtolower($message);
        $score = $lead->lead_score ?? 20;

        // Scoring rules matching business specification
        if (str_contains($text, 'daftar') || str_contains($text, 'gabung') || str_contains($text, 'transfer') || str_contains($text, 'bayar')) {
            $score = max($score, 90);
        } elseif (str_contains($text, 'visit') || str_contains($text, 'datang') || str_contains($text, 'lokasi')) {
            $score = max($score, 75);
        } elseif (str_contains($text, 'promo') || str_contains($text, 'diskon') || str_contains($text, 'paket')) {
            $score = max($score, 50);
        } elseif (str_contains($text, 'harga') || str_contains($text, 'biaya') || str_contains($text, 'fasilitas')) {
            $score = max($score, 35);
        }

        if ($score !== $lead->lead_score) {
            $lead->lead_score = $score;
            
            // Auto update status if score reaches hot and not currently handled manually
            if ($score >= 70 && !in_array($lead->status, ['Handover to CS', 'Visit Scheduled', 'Closed Won', 'Closed Lost'])) {
                $lead->status = 'Warm'; // or Hot when triggered for CS handover
            }
            $lead->save();
        }

        return $score;
    }
}
