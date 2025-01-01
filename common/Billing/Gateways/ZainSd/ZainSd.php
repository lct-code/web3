<?php namespace Common\Billing\Gateways\ZainSd;

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

class ZainSd implements CommonSubscriptionGatewayActions
{
    use InteractsWithZainSdRestApi;

    public function __construct(
        protected Settings $settings
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
            'msisdn' => $this->processUserPhone($subscription->user->phone),
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
            'cancelled_at' => now(),
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
        if (!$user) {
            try {   
                $loggedInUser = Auth::user();
                $user = app(FortifyRegisterUser::class)->create([
                    'phone' => $phone,
                ], true);
                    // Clear existing token if any
                if ($loggedInUser) {
                    $loggedInUser->tokens()->delete();
                    // session()->flush();
                    auth()->guard('web')->login($user, true);
                    Log::info('Logged in user ' . $user->phone);    
                    // Refresh token and bootstrap data
                } else {
                    Auth::login($user, true); // true for "remember me"
                }
                    // Generate API token if needed
                $token = $user->createToken('default-token');
                
                // Load permissions and bootstrap data
                $user->loadPermissions();
                
                // Set bootstrap data in session
                app(BaseBootstrapData::class)
                    ->init()
                    ->set('user', $user);
            } catch (\Exception $e) {
                Log::error('Failed to create local subscription for Zain SD', [
                    'error' => $e->getMessage(),
                    'phone' => $phone,
                ]);
                throw new GatewayException(__('Could not create the subscription'));
            }
        }

        // Update existing user
        // if (!$user && $loggedInUser) {
        //     try {
        //         $user = $loggedInUser;
        //         $user->phone = $phone;
        //         $user->save();
        //     } catch (\Exception $e) {
        //         Log::error('Failed to add phone to user', [
        //             'error' => $e->getMessage(),
        //             'phone' => $phone,
        //         ]);
        //         throw new GatewayException(__('Could not update user phone'));
        //     }
        // }

        // Switch authentication if needed
        $price = Price::where('zain_sd_product_code', $productCode)->firstOrFail();
        
        return $user->subscribe('zain_sd', $subscriptionData['id'], $price);
    }

    public function syncSubscriptionDetails(string $phone, string $productCode): array
    {
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

        if (!$response->successful()) {
            Log::error('ZainSD syncSubscriptionDetails HTTP error: ' . $response->status());
            throw new GatewayException(__('Could not connect to Zain SD service'));
        }

        $data = $response->json();
        // if( $data['error_code'] == 111) {
        //     $data['subscription_data'] = [
        //         "id" => "4",
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

        // Find subscription by phone and product code
        $subscription = Subscription::where('gateway_id',$data['subscription_data']['id'])->first();

        // If no subscription found and subscription is active on Zain SD, create it locally
        $subscriptionData = $data['subscription_data'];
        $isActive = (bool) ($subscriptionData['is_active'] ?? false);

        if (!$subscription && $isActive) {
            try {
                $subscription = $this->storeSubscriptionLocally($subscriptionData, $phone, $productCode);
                Log::info('Created local subscription for Zain SD user', [
                    'phone' => $phone,
                    'product_code' => $productCode,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to create local subscription for Zain SD3', [
                    'error' => $e->getMessage(),
                    'phone' => $phone,
                    'product_code' => $productCode,
                ]);
                throw new GatewayException(__('Could not create local subscription record'));
            }
        } 

        if ($subscription) {
            if ($isActive) {
                // if we need to switch users:
                $user = User::where('phone', $phone)->first();
                $loggedInUser = Auth::user();
                if ($user && !$loggedInUser || ($user && $loggedInUser && $user->id !== $loggedInUser->id)) {
                    // Clear existing token if any
                    if ($loggedInUser) {
                        $loggedInUser->tokens()->delete();
                        // session()->flush();
                    }
                    
                    auth()->guard('web')->login($user, true);
                    Log::info('Logged in user ' . $user->phone);
                    
                    // Refresh token and bootstrap data
                    $token = $user->createToken('default-token');
                    $user->loadPermissions();
                    
                    app(BaseBootstrapData::class)
                        ->init()
                        ->set('user', $user);
                }
        

                // Convert unix timestamp to datetime
                $renewsAt = isset($subscriptionData['subdate_unix']) 
                    ? Carbon::createFromTimestamp($subscriptionData['subdate_unix'])
                    : null;
                    
                $subscription->update([
                    'ends_at' => null,
                    'cancelled_at' => null,
                    'renews_at' => $renewsAt,
                ]);
            } else {
                // If not active, mark as cancelled
                $unsubDate = isset($subscriptionData['unsubdate_unix'])
                    ? Carbon::createFromTimestamp($subscriptionData['unsubdate_unix'])
                    : now();
                    
                $subscription->update([
                    'ends_at' => $unsubDate,
                    'cancelled_at' => $unsubDate,
                ]);
            }
        }

        return [
            'subscription' => $subscription?->fresh(),
            'is_active' => $isActive,
        ];
    }

    public function subscribe(string $productCode, string $phone, User $user): bool
    {
        // TODO: When implementing subscription creation, use storeSubscriptionLocally helper
        throw new GatewayException(__('Subscription creation not implemented for Zain SD'));
    }

    protected function handleZainSdError(array $data, string $context = ''): void 
    {
        if (!$data['success']) {
            Log::error("ZainSD {$context} error: " . json_encode($data));
            
            $errorMessage = match($data['error_code'] ?? null) {
                111 => __('This number is not subscribed to this service'),
                102 => __('Invalid phone number format'),
                113 => __('You already have an active subscription'),
                118 => __('Subscription is currently inactive'),
                1000 => __('Could not verify subscription status. Please try again later'),
                1003 => __('Could not verify subscription status. Please try again later'),
                default => __('Could not complete the request. Please try again later')
            };
            
            throw new GatewayException($errorMessage);
        }
    }
} 