<?php

namespace App\Domain\Leads\Enums;

enum LeadStatusEnum: string
{
    case NEW_LEAD = 'New Lead';
    case COLD = 'Cold';
    case WARM = 'Warm';
    case HOT = 'Hot';
    case HANDOVER_TO_CS = 'Handover to CS';
    case VISIT_SCHEDULED = 'Visit Scheduled';
    case CLOSED_WON = 'Closed Won';
    case CLOSED_LOST = 'Closed Lost';

    public function isHandledManually(): bool
    {
        return match($this) {
            self::HANDOVER_TO_CS,
            self::VISIT_SCHEDULED,
            self::CLOSED_WON,
            self::CLOSED_LOST => true,
            default => false,
        };
    }

    public static function fromScore(int $score): self
    {
        if ($score >= 70) {
            return self::HOT;
        } elseif ($score >= 41) {
            return self::WARM;
        }
        return self::COLD;
    }
}
