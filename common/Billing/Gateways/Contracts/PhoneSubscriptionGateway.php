<?php

namespace Common\Billing\Gateways\Contracts;

use App\Models\User;

interface PhoneSubscriptionGateway extends CommonSubscriptionGatewayActions
{
    public function subscribeStart(string $priceId, string $phone, ?User $user): array;
    public function subscribeVerify(string $priceId, User $user, string $authCode): array;
    public function syncSubscriptionDetails(string $identifier, User $user): array;
}