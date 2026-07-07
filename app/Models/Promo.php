<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'promo_name',
        'description',
        'price',
        'bonus',
        'valid_until',
        'terms',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'valid_until' => 'date',
        'is_active' => 'boolean',
    ];
}
