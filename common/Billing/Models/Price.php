<?php

namespace Common\Billing\Models;

use Common\Billing\Subscription;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Price extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'amount' => 'float',
        'interval_count' => 'int',
        'default' => 'boolean',
        'subscriptions_count' => 'int',
        'paymentMethods' => 'json',
    ];

    const MODEL_TYPE = 'price';

    public static function getModelTypeAttribute(): string
    {
        return self::MODEL_TYPE;
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function getPaymentMethodsAttribute($value)
    {
        return json_decode($value, true);
    }

    public function setPaymentMethodsAttribute($value)
    {
        $this->attributes['paymentMethods'] = json_encode($value);
    }
}
