<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WaStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'text',
        'bg_color',
        'scheduled_at',
        'status',
        'sent_at'
    ];
}
