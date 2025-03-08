<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RBTPlay extends Model
{
    use HasFactory;

    const UPDATED_AT = null;
    protected $guarded = ['id'];
    protected $casts = ['user_id' => 'integer', 'RBT_id' => 'integer'];

    public function RBT(): BelongsTo {
        return $this->belongsTo(RBT::class);
    }
}
