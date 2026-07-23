<?php

namespace App\Domain\Leads\DTOs;

use App\Domain\Leads\Enums\LeadStatusEnum;

readonly class LeadData
{
    public function __construct(
        public string $phone,
        public ?string $name = null,
        public ?string $goal = null,
        public ?string $interest = null,
        public ?string $budget = null,
        public ?string $location = null,
        public LeadStatusEnum $status = LeadStatusEnum::NEW_LEAD,
        public int $leadScore = 20,
        public ?int $assignedTo = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            phone: $data['phone'],
            name: $data['name'] ?? null,
            goal: $data['goal'] ?? null,
            interest: $data['interest'] ?? null,
            budget: $data['budget'] ?? null,
            location: $data['location'] ?? null,
            status: isset($data['status']) ? LeadStatusEnum::from($data['status']) : LeadStatusEnum::NEW_LEAD,
            leadScore: (int) ($data['lead_score'] ?? 20),
            assignedTo: isset($data['assigned_to']) ? (int) $data['assigned_to'] : null,
        );
    }
}
