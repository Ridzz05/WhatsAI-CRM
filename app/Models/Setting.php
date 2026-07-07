<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'company_website',
        'system_website',
        'instagram_url',
        'gym_name',
        'gym_address',
        'features_list',
        'trainers_list'
    ];
}
