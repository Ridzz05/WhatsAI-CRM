<?php

namespace App\Domain\Handovers\Actions;

use App\Models\Lead;
use App\Models\Handover;
use Illuminate\Support\Facades\Log;

class TriggerCsHandoverAction
{
    /**
     * Trigger CS Handover for a lead.
     */
    public function execute(Lead $lead, string $summary, ?string $reason = 'Hot lead detected'): Handover
    {
        $lead->update([
            'status' => 'Handover to CS'
        ]);

        $existing = Handover::where('lead_id', $lead->id)->where('status', 'pending')->first();
        if ($existing) {
            $existing->update([
                'summary' => $summary,
                'reason' => $reason
            ]);
            return $existing;
        }

        Log::info("🔔 [Handover Action] Lead {$lead->phone} triggered CS handover. Reason: {$reason}");

        return Handover::create([
            'lead_id' => $lead->id,
            'summary' => $summary,
            'reason' => $reason,
            'assigned_to' => $lead->assigned_to,
            'status' => 'pending'
        ]);
    }
}
