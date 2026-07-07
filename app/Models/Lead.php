<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'goal',
        'interest',
        'budget',
        'location',
        'status',
        'lead_score',
        'followup_sent',
        'assigned_to',
    ];

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'lead_id');
    }

    public function handovers()
    {
        return $this->hasMany(Handover::class, 'lead_id');
    }
}
