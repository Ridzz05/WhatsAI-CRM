<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Membership extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'plan_name',
        'start_date',
        'end_date',
        'status',
        'reminder_sent_h7',
        'reminder_sent_h3',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'reminder_sent_h7' => 'boolean',
        'reminder_sent_h3' => 'boolean',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
