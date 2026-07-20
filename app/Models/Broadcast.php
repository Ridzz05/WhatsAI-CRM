<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Broadcast extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'attachment_type',
        'media_url',
        'send_schedule',
        'recurrence_pattern',
        'delay_min',
        'delay_max',
        'chunk_size',
        'pause_min',
        'pause_max',
        'status',
        'total_recipients',
        'sent_count',
        'failed_count'
    ];

    public function recipients()
    {
        return $this->hasMany(BroadcastRecipient::class);
    }
}
