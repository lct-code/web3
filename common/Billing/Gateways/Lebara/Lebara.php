<?php

namespace Common\Billing\Gateways\Lebara;

use App\Models\User;
use App\User as AppUser;
use Common\Billing\Gateways\Contracts\CommonSubscriptionGatewayActions;
use Common\Billing\Gateways\Contracts\PhoneSubscriptionGateway;
use Common\Billing\Models\Price;
use Common\Billing\Models\Product;
use Common\Billing\Subscription;
use Common\Billing\GatewayException;
use Common\Settings\Settings;
use Exception;
use Illuminate\Support\Facades\Log;
use Common\Auth\Traits\HandlesPhoneVerification;
use Common\Billing\Gateways\Traits\HandlesPhoneSubscriptionErrors;

class Lebara implements CommonSubscriptionGatewayActions, PhoneSubscriptionGateway
{
    use InteractsWithLebaraRestApi;
    use HandlesPhoneVerification;
    use HandlesPhoneSubscriptionErrors;

    public function __construct(
        protected Settings $settings
    ) {}

    public function isEnabled(): bool
    {
        return (bool) app(Settings::class)->get('billing.lebara.enable');
    }

    public function syncPlan(Product $product): bool
    {
        Log::debug('Lebara syncPlan: ' . $product->toJson());
        return true;
    }

    public function deletePlan(Product $product): bool
    {
        Log::debug('Lebara deletePlan: ' . $product->toJson());
        return true;
    }

    public function storeSubscriptionDetailsLocally(
        string $serviceConnectionId,
        string $lebaraSubscriptionId,
        User|AppUser $user
    ): bool {
        Log::debug('Lebara storeSubscriptionDetailsLocally: ' . $serviceConnectionId . ' / ' . $lebaraSubscriptionId . ' / ' . $user->id);

        $price = Price::where('lebara_service_id', $serviceConnectionId)->firstOrFail();

        $user->subscribe('lebara', $lebaraSubscriptionId, $price);
        return true;
    }

    public function changePlan(
        Subscription $subscription,
        Product $newProduct,
        Price $newPrice
    ): bool {
        Log::debug('Lebara changePlan: ' . $newProduct->toJson() . ' / ' . $subscription->toJson() . ' / ' . $newPrice->toJson());
        return true;
    }

    public function cancelSubscription(
        Subscription $subscription,
        bool $atPeriodEnd = true
    ): bool {
        Log::debug('Lebara cancelSubscription: ' . $subscription->toJson() . ' / ' . ($atPeriodEnd ? 'atPeriodEnd' : 'notPeriodEnd'));

        try {
            $response = $this->lebara('get', 'users.unsub_user', [
                'msisdn' => $this->processUserPhone($subscription->user),
                'service_connection_id' => $subscription->price->lebara_service_id,
                'send_already_unsub' => 0,
                'send_unsub' => 1,
            ])->get('');

            log::debug('Lebara cancelSubscription response: ' . json_encode($response->json()));
            // do not throw an exception if the response status is 400 and the code is 5010 because it means the user is trying to unsubscribe when he is already unsubscribed.
            if ($response->status() === 400 && $response->json()['code'] === 5010) {
                return true;
            } else {
                $data = $this->parseLebaraResponse($response);
            }

            if (isset($data['data']['unsubscribe']) && $data['data']['unsubscribe'] === true) {
                return true;
            }

            Log::error('Lebara unsubscribe failed: ' . json_encode($data));
            return false;
        } catch (Exception $e) {
            Log::error('Lebara cancelSubscription error: ' . $e->getMessage());
            throw new GatewayException(__('Could not cancel Lebara subscription.'));
        }
    }

    public function resumeSubscription(
        Subscription $subscription,
        array $gatewayParams = []
    ): bool {
        Log::debug('Lebara resumeSubscription: ' . $subscription->toJson() . ' / ' . json_encode($gatewayParams));
        throw new GatewayException(__('Could not renew Lebara subscription.'));
    }

    public function subscribeStart(
        string $price_id,
        string $phone,
        User|null $user
    ): array {
        Log::debug('Lebara subscribeStart: ' . $price_id . ' / ' . $phone . ' / ' . $user?->id);

        $processedPhone = $this->processUserPhone($user, $phone);

        $price = Price::where('id', $price_id)->firstOrFail();

        try {
            $response = $this->lebara('get', 'users.send_pincode', [
                'msisdn' => $processedPhone,
                'service_connection_id' => $price->lebara_service_id,
                'async' => 1,
            ])->get('');

            $data = $this->parseLebaraResponse($response);

            if (isset($data['data']['sent']) && $data['data']['sent'] == 1) {
                return [
                    'status' => 'verify',
                    'phone' => $processedPhone,
                ];
            }

            throw new GatewayException(__('Failed to send verification code.'));
        } catch (Exception $e) {
            Log::error('Lebara subscribeStart error: ' . $e->getMessage());
            throw new GatewayException(__('Could not send verification code. Please try again.'));
        }
    }

    public function subscribeVerify(
        string $price_id,
        User $user,
        string $auth_code
    ): array {
        Log::debug('Lebara subscribeVerify: ' . $price_id . ' / ' . $user->id . ' / ' . $auth_code);

        $price = Price::where('id', $price_id)->firstOrFail();

        try {
            $response = $this->lebara('get', 'users.subscribe_pincode', [
                'msisdn' => $this->processUserPhone($user),
                'service_connection_id' => $price->lebara_service_id,
                'pincode' => $auth_code,
            ])->get('');

            $data = $this->parseLebaraResponse($response);

            if (isset($data['data']['subscribe']) && $data['data']['subscribe'] === true) {
                // Mark phone as verified after successful OTP verification
                $this->markPhoneAsVerified($user);

                // Store subscription locally
                $lebaraSubscriptionId = 'lebara_' . $data['data']['user_id'] . '_' . time();
                $this->storeSubscriptionDetailsLocally($price->lebara_service_id, $lebaraSubscriptionId, $user);

                return [
                    'status' => 'verified',
                    'message' => __('Your verification code has been validated successfully.'),
                ];
            }

            $this->handleCommonPhoneErrors('AUTH_INVALID', 'subscribeVerify', [
                'price_id' => $price_id,
                'user_id' => $user->id,
                'auth_code' => $auth_code
            ], __('Invalid verification code.'));
        } catch (Exception $e) {
            Log::error('Lebara subscribeVerify error: ' . $e->getMessage());
            throw new GatewayException(__('Could not complete the verification. Please try again.'));
        }

        // This should never be reached, but needed for type safety
        throw new GatewayException(__('Unexpected error occurred during verification.'));
    }

    public function syncSubscriptionDetails(
        string $priceId,
        User $user
    ): array {
        Log::debug('Lebara syncSubscriptionDetails: ' . $priceId . ' / ' . $user->id);

        $price = Price::where('id', $priceId)->firstOrFail();
        Log::debug('Lebara syncSubscriptionDetails.lebara_service_id: ' . $price->lebara_service_id);

        try {
            $response = $this->lebara('get', 'users.check_subscription', [
                'msisdn' => $this->processUserPhone($user),
                'service_connection_id' => $price->lebara_service_id,
                'next_renewal_date' => now()->addMonth()->format('Y-m-d H:i:s'), // Placeholder
            ])->get('');

            $data = $this->parseLebaraResponse($response);

            if (isset($data['data']['is_subscribed']) && $data['data']['is_subscribed']) {
                $subscription = Subscription::where('price_id', $priceId)
                    ->where('user_id', $user->id)
                    ->orderByDesc('id')
                    ->first();

                if ($subscription) {
                    return [
                        'status' => 'success',
                        'subscriptionId' => $subscription->id,
                        'message' => __('You\'ve been successfully subscribed to the service.'),
                    ];
                }
            }

            return ['status' => 'error', 'message' => __('Subscription not found or inactive.')];
        } catch (Exception $e) {
            Log::error('Lebara syncSubscriptionDetails error: ' . $e->getMessage());
            throw new GatewayException(__('Could not check subscription status.'));
        }
    }

    public function processUserPhone(User|null $user, $newPhone = null): string
    {
        $processedPhone = preg_replace('/^\+/', '',  $newPhone ?? $user->phone);
        return $processedPhone;
    }
}
