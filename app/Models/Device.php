<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'session_id',
        'phone_number',
        'branch_id',
        'status',
        'qr_code',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }
}
