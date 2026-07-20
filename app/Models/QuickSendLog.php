<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuickSendLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'name',
        'message',
        'channel',
        'status',
        'sent_at'
    ];
}
