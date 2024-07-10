<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RewardLinkTransaction extends Model
{
    use HasFactory;

    protected $table = 'reward_link_transactions';

    protected $fillable = [
        'reward_link_id',
        'user_id',
    ];

    // prevent laravel from saving updated_at column
    public function setUpdatedAt($value)
    {
        return $this;
    }
}
