<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RewardLink extends Model
{
    use HasFactory;

    protected $table = 'reward_links';

    protected $fillable = [
        'reward_code',
    ];
}
