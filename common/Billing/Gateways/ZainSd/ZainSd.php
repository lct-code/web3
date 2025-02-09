<?php
namespace Common\Billing\Gateways\ZainSd;

use App\Models\User;
use Common\Billing\Gateways\Contracts\CommonSubscriptionGatewayActions;
use Common\Billing\Models\Price;
use Common\Billing\Models\Product;
use Common\Billing\Subscription;
use Common\Settings\Settings;
use Common\Billing\GatewayException;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Common\Auth\Fortify\FortifyRegisterUser;
use Common\Core\Bootstrap\BaseBootstrapData;
use Illuminate\Http\Request;
use Common\Auth\Traits\HandlesPhoneVerification;
use Common\Billing\Gateways\Traits\HandlesPhoneSubscriptionErrors;

class ZainSd implements CommonSubscriptionGatewayActions
{
    use InteractsWithZainSdRestApi;
    use HandlesPhoneVerification;
    use HandlesPhoneSubscriptionErrors;

    public function __construct(
        protected Settings $settings,
        protected Request $request,
    ) {
    }

    public function isEnabled(): bool
    {
        return (bool) app(Settings::class)->get('billing.zain_sd.enable');
    }

    public function syncPlan(Product $product): bool
    {
        // Zain SD doesn't require plan syncing
        return true;
    }

    public function deletePlan(Product $product): bool
    {
        // Zain SD doesn't require plan deletion
        return true;
    }

    public function changePlan(
        Subscription $subscription,
        Product $newProduct,
        Price $newPrice
    ): bool {
        // First cancel the current subscription
        $this->cancelSubscription($subscription, false);

        // Then create a new subscription with the new plan
        return $this->subscribe(
            $newPrice->zain_sd_product_code,
            $subscription->user->phone,
            $subscription->user
        );
    }

    public function cancelSubscription(
        Subscription $subscription,
        bool $atPeriodEnd = true
    ): bool {
        $response = $this->zainSd()->post('/v1/json/cancel.php', [
            'msisdn' => $this->processUserPhone('0'.ltrim($subscription->user->phone,'+249')),
            'product_code' => $subscription->price->zain_sd_product_code,
        ]);

        if (!$response->successful()) {
            Log::error('ZainSD cancelSubscription HTTP error: ' . $response->status());
            throw new GatewayException(__('Could not connect to Zain SD service'));
        }

        $data = $response->json();
        $this->handleZainSdError($data, 'cancelSubscription');

        // Update local subscription status
        $subscription->update([
            'ends_at' => now(),
        ]);

        return true;
    }

    public function resumeSubscription(
        Subscription $subscription,
        array $gatewayParams = []
    ): bool {
        // Zain SD doesn't support subscription resumption
        throw new GatewayException(__('Subscription resumption not supported by Zain SD'));
    }

    protected function storeSubscriptionLocally(array $subscriptionData, string $phone, string $productCode): Subscription
    {
        $user = User::where('phone', $phone)->first();
        $loggedInUser = Auth::user();

        // Create new user if needed
        // Log::info('user' . json_encode($user) . json_encode($loggedInUser));
        if (!$user) {
            try {
                // Log::info('@Create user');
                $user = app(FortifyRegisterUser::class)->create([
                    'phone' => $phone,
                ], true);
                // Clear existing token if any
                // Log::info('storeSubscriptionLocally switchUsers when there is no user');
                $this->switchUsers($user, $loggedInUser);
            } catch (\Exception $e) {
                Log::error('Failed to create local subscription for Zain SD', [
                    'error' => $e,
                    'phone' => $phone,
                    'session' => session()->all(),

                ]);
                throw new GatewayException(__('Could not create the subscription'));
            }
        } else if ($user && !$loggedInUser || ($user && $loggedInUser && $user->id !== $loggedInUser->id)) {
            // Log::info('storeSubscriptionLocally switchUsers when there is a user');
            $this->switchUsers($user, $loggedInUser);
        }

        $price = Price::where('zain_sd_product_code', $productCode)->firstOrFail();
        return $user->subscribe('zain_sd', $subscriptionData['id'], $price);
    }

    public function syncSubscriptionDetails(string $phone, string $productCode): array
    {
        session()->put('zain_sd_validated', true);
        // if the phone number start with + or 0, remove the + or 0
        $phone = ltrim($phone, '+');
        $phone = ltrim($phone, '0');
        // if the phone number starts with 249, remove 249 
        if (strpos($phone, '249') === 0) {
            $phone = substr($phone, 3);
        }
        // add zero at the beginning to match zain sd format
        $phone = '0' . $phone;

        $input = [
            'msisdn' => $this->processUserPhone($phone),
            'product_code' => $productCode,
        ];
        $response = $this->zainSd()->post('/v1/json/check.php', $input);

        $phone = ltrim($phone, '0');
        $phone = '+249' . $phone;

        if (!$response->successful()) {
            Log::error('ZainSD syncSubscriptionDetails HTTP error: ' . $response->status());
            throw new GatewayException(__('Could not connect to Zain SD service'));
        }

        $data = $response->json();
        // if ($data['error_code'] == 111) {
        //     $data['subscription_data'] = [
        //         "id" => '14439',
        //         "msisdn" => "249908723839",
        //         "operator_id" => "1",
        //         "product_id" => "3",
        //         "is_active" => "1",
        //         "price" => "5.00",
        //         "channel" => "api",
        //         'subdate_unix' => Carbon::now()->timestamp,
        //         'unsubdate_unix' => Carbon::now()->addDays(30)->timestamp,
        //         'retry_unix' => null,
        //         'thread_id' => null,
        //         'creation_date' => now()->format('Y-m-d H:i:s'),
        //     ];
        //     $data['success'] = true;
        //     $data['error_code'] = 0;
        // }
        $dataError = $data;
        $dataError['phone'] = $phone;
        $dataError['product_code'] = $productCode;
        $this->handleZainSdError($dataError, 'syncSubscriptionDetails');

        $subscription = Subscription::where('gateway_id', $data['subscription_data']['id'])->first();

        $subscriptionData = $data['subscription_data'];
        $isActive = (bool) ($subscriptionData['is_active'] ?? false);

        // If no subscription found and subscription is active on Zain SD, create it locally
        if (!$subscription && $isActive) {
            try {
                $subscription = $this->storeSubscriptionLocally($subscriptionData, $phone, $productCode);
            } catch (\Exception $e) {
                Log::error('Failed to create local subscription for Zain SD3', [
                    'error' => $e->getMessage(),
                    'phone' => $phone,
                    'product_code' => $productCode,
                ]);
                throw new GatewayException(__('Could not create local subscription record'));
            }
        } else if ($subscription) {
            // Log::debug('Subscription found');
            if ($isActive) {
                // if we need to switch users:
                $user = User::where('phone', $phone)->first();
                $loggedInUser = Auth::user();
                if ($user && !$loggedInUser || ($user && $loggedInUser && $user->id !== $loggedInUser->id)) {
                    // Clear existing token if any
                    // Log::info('syncSubscriptionDetails switchUsers');
                    $this->switchUsers($user, $loggedInUser);
                }


                // Convert unix timestamp to datetime
                $renewsAt = isset($subscriptionData['unsubdate_unix'])
                    ? Carbon::createFromTimestamp($subscriptionData['unsubdate_unix'])
                    : null;

                $subscription->update([
                    'ends_at' => null,
                    'renews_at' => $renewsAt,
                ]);
            } else {
                // If not active, mark as cancelled
                $unsubDate = isset($subscriptionData['unsubdate_unix'])
                    ? Carbon::createFromTimestamp($subscriptionData['unsubdate_unix'])
                    : now();

                $subscription->update([
                    'ends_at' => $unsubDate,
                ]);
            }
        }

        return [
            'subscription' => $subscription?->fresh(),
            'is_active' => $isActive,
        ];
    }

    public function switchUsers(User $user, User|null $loggedInUser): void
    {
        if ($loggedInUser) {
            // Log::info('switchUsers old session', session()->all());
            $loggedInUser->tokens()->delete();
            auth()->guard('web')->logout();
            session()->flush();
        }
        auth()->guard('web')->login($user, true);
        // auth()->login($user, true);
        session()->regenerate();
        session()->regenerateToken();
        session()->put('zain_sd_validated', true);
        session()->put('user_id', $user->id);
        // Log::info('switchUsers new session', session()->all());

        $token = $user->createToken('default-token');
        $user->loadPermissions();

        // Log::info('switchUsers reinitialize bootstrap data with user id' . $user->id);
        app(BaseBootstrapData::class)
            ->set('user', $user)
            ->init();
        // Log::info('switchUsers reinitialize bootstrap data with user id done');
    }

    public function subscribe(string $productCode, string $phone, User $user): bool
    {
        // TODO: When implementing subscription creation, use storeSubscriptionLocally helper
        throw new GatewayException(__('Subscription creation not implemented for Zain SD'));
    }

    protected function handleZainSdError(array $data, string $context = '', array $metadata = []): void
    {
        if (!$data['success']) {
            $this->handleCommonPhoneErrors(
                $this->mapZainSdErrorCode($data['error_code'] ?? 'UNKNOWN_ERROR'),
                $context,
                metadata: $metadata
            );
        }
    }
}