<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BroadcastRecipient extends Model
{
    use HasFactory;

    protected $fillable = [
        'broadcast_id',
        'phone',
        'name',
        'status',
        'error_message',
        'sent_at'
    ];

    public function broadcast()
    {
        return $this->belongsTo(Broadcast::class);
    }
}
