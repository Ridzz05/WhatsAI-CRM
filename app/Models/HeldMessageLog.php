<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeldMessageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'phone',
        'customer_name',
        'message',
        'reason',
        'status',
        'muted_until',
    ];

    protected $casts = [
        'muted_until' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
