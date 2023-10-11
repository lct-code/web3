<?php namespace Common\Billing\Gateways\Phonesub;

use App\User;
use Common\Billing\Gateways\Contracts\CommonSubscriptionGatewayActions;
use Common\Billing\Models\Price;
use Common\Billing\Models\Product;
use Common\Billing\Subscription;
use Common\Billing\GatewayException;
use Common\Settings\Settings;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;

class Phonesub implements CommonSubscriptionGatewayActions
{
    use InteractsWithPhonesubRestApi;

    public function __construct(
        protected Settings $settings
    ) {

        if (app(Settings::class)->get('billing.phonesub_test_mode')) {

            $resp_zero = <<<END
<response>
    <resultCode>000000</resultCode>
    <resultDesc>The operation succeeds.</resultDesc>
    <effectiveTime>5</effectiveTime>
</response>
END;

            Http::fake(['*' => Http::response($resp_zero, 200)]);
        }
    }

    public function isEnabled(): bool
    {
        return (bool) app(Settings::class)->get('billing.phonesub.enable');
    }

    public function syncPlan(Product $product): bool
    {
        Log::debug('phonesub syncPlan: '.$product->toJson());
        return true;
    }

    public function deletePlan(Product $product): bool
    {
        Log::debug('phonesub deletePlan: '.$product->toJson());
        return true;
    }

    public function storeSubscriptionDetailsLocally(
        string $phonesubSubscriptionId,
        User $user
    ): bool {
        Log::debug('phonesub storeSubscriptionDetailsLocally: '.$phonesubSubscriptionId.' / '.$user->id);
        return true;

        $response = $this->phonesub()->get(
            "billing/subscriptions/$phonesubSubscriptionId",
        );

        if ($response->successful() && $response['status'] === 'ACTIVE') {
            $price = Price::where(
                'phonesub_id',
                $response['plan_id'],
            )->firstOrFail();
            $user->subscribe('phonesub', $response['id'], $price);
            return true;
        }

        return false;
    }

    private function createSubscription(
        Price $price,
        User $user,
    ): Subscription {

      $phonesub_id = $this->getUserPhone($user).'/'.date('YmdHis');
      return $user->subscribe('phonesub', $phonesub_id, $price);
    }

    public function changePlan(
        Subscription $subscription,
        Product $newProduct,
        Price $newPrice
    ): bool {
        Log::debug('phonesub changePlan: '.$newProduct->toJson().' / '.$subscription->toJson().' / '.$newPrice.toJson());
        return true;
    }

    public function subscribeStart(
        string $price_id,
        User $user
    ) {
        Log::debug('phonesub subscribeStart: '.$price_id.' / '.$user->id);
        
        $price = Price::where('id', $price_id)->firstOrFail();
        $response = $this->phonesub()->get(
          'genSubscribeAuthCode.do', [
            'actionType' => 1,
            'msisdn' => $this->getUserPhone($user),
            'productID' => $price->sub_product_id,
          ]
        );

        if ($response->successful()) {
            $xml = $this->parseXml($response);

            $resultCode = (string) $xml->resultCode;

            switch ($resultCode) {
            case '000000':
                return [
                    'status' => 'verify',
                ];

            case '330070':
            case '310001':
                throw new GatewayException(__('Phone number entered is invalid. Make sure it is Zain KSA phone number and try again'));

            case '330040':
                return [
                    'status' => 'subscribed',
                    'message' => __('You\'re already subscribed to the service.'),
                ];

            default:
                Log::error("phoneSub gateway - unexpected response code [$resultCode]");
                throw new GatewayException(__('Unexpected response code. Please try again later.'));
            }
        }
        else {
          Log::error("phoneSub gateway - unexpected response (".$response->status()."): ".$response->body());
          throw new GatewayException(__('Unexpexted SUB server response.'));
        }

        return false;
    }

    public function subscribeVerify(
        string $price_id,
        User $user,
        string $auth_code
    ) {
        Log::debug('phonesub subscribeVerify: '.$price_id.' / '.$user->id.' / '.$auth_code);
        
        $price = Price::where('id', $price_id)->firstOrFail();
        $response = $this->phonesub()->get(
          'subscribeProductByAuthCode.do', [
            'authCode' => $auth_code,
            'msisdn' => $this->getUserPhone($user),
            'productID' => $price->sub_product_id,
          ]
        );

        if ($response->successful()) {
            $xml = $this->parseXml($response);

            $resultCode = (string) $xml->resultCode;

            $result = 'unknown';
            switch ($resultCode) {
            case '000000':
                $subscription = $this->createSubscription($price, $user);
                return [
                    'status' => 'subscribed',
                    'message' => __('You\'ve been successfully subscribed to the service.'),
                    'subscriptionId' => $subscription->id,
                ];

            case '330157':
                throw new GatewayException(__('Invalid verification code. Please try again. You have :attempts attempt(s) left.', ['attempts'=>'?']));

            case '330158':
                return [
                    'status' => 'expired',
                    'error' => [
                      'message' => __('The SMS verification code has expired. You can request a new code below.'),
                    ]
                ];

            default:
                throw new GatewayException(__('Unexpected response code. Please try again later.'));
            }
        }

        return false;
    }

    public function cancelSubscription(
        Subscription $subscription,
        bool $atPeriodEnd = true
    ): bool {
        Log::debug('phonesub changePlan: '.$subscription->toJson().' / '.($atPeriodEnd?'atPeriodEnd':'notPeriodEnd'));
        return true;
    }

    public function resumeSubscription(
        Subscription $subscription,
        array $gatewayParams = []
    ): bool {
        Log::debug('phonesub changePlan: '.$subscription->toJson().' / '.json_encode($gatewayParams));
        return true;
    }

    public function getUserPhone(User $user): string {
        return preg_replace('/^\+/', '', $user->phone);
    }

    public function parseXml(Response $response): SimpleXMLElement {
        $xml_string = $response->body();
        Log::debug('parsing xml response: '.$xml_string);

        return new SimpleXMLElement($xml_string);
    }
}
