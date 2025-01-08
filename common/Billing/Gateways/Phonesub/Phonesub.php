<?php namespace Common\Billing\Gateways\Phonesub;

use App\Models\User;
use Common\Billing\Gateways\Contracts\CommonSubscriptionGatewayActions;
use Common\Billing\Models\Price;
use Common\Billing\Models\Product;
use Common\Billing\Subscription;
use Common\Billing\GatewayException;
use Common\Settings\Settings;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;
use Common\Auth\Traits\HandlesPhoneVerification;

class Phonesub implements CommonSubscriptionGatewayActions
{
    use InteractsWithPhonesubRestApi;
    use HandlesPhoneVerification;

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
            Http::fake([config('services.phonesub.baseurl_sub').'*' => Http::response($resp_zero, 200)]);

            $resp_unsub = <<<'END'
<?xml version="1.0" encoding="utf-8" ?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <soapenv:Body>
        <ns1:unSubscribeProductResponse xmlns:ns1="http://www.csapi.org/schema/parlayx/subscribe/manage/v1_0/local">
            <ns1:unSubscribeProductRsp>
                <result>00000000</result>
                <resultDescription>UnSubscribe Success. Detailed description:  userID : [ 966xxxxxxxxx ] was unsubscribed !</resultDescription>
            </ns1:unSubscribeProductRsp>
        </ns1:unSubscribeProductResponse>
    </soapenv:Body>
</soapenv:Envelope>
END;
            Http::fake([config('services.phonesub.baseurl_unsub').'*' => Http::response($resp_unsub, 200)]);
        }

        $this->timestamp = date('YmdHis');
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
        string $subProductId,
        string $phonesubSubscriptionId,
        User $user
    ): bool {
        Log::debug('phonesub storeSubscriptionDetailsLocally: '.$subProductId.' / '.$phonesubSubscriptionId.' / '.$user->id);

        $price = Price::where(
          'sub_product_id',
          $subProductId,
        )->firstOrFail();

        $user->subscribe('phonesub', $phonesubSubscriptionId, $price);
        return true;
    }

    public function changePlan(
        Subscription $subscription,
        Product $newProduct,
        Price $newPrice
    ): bool {
        Log::debug('phonesub changePlan: '.$newProduct->toJson().' / '.$subscription->toJson().' / '.$newPrice->toJson());
        return true;
    }

    public function subscribeStart(
        string $price_id,
        string $phone,
        User|null $user
    ) {
        Log::debug('phonesub subscribeStart: '.$price_id.' / '.$phone.' / '.$user?->id);

        $processedPhone = $this->processUserPhone($user, $phone);
        
        $price = Price::where('id', $price_id)->firstOrFail();

        $params = [
          'actionType' => 1,
          'msisdn' => $processedPhone,
          'productID' => $price->sub_product_id,
        ];

        Log::debug('phonesub GET genSubscribeAuthCode.do?'.http_build_query($params));

        $response = $this->phonesub()->get(
          'genSubscribeAuthCode.do', $params
        );

        if ($response->successful()) {
            $xml = $this->parseXml($response);

            $resultCode = (string) $xml->resultCode;

            switch ($resultCode) {
            case '000000':
                return [
                    'status' => 'verify',
                    'phone' => $processedPhone,
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

        $params = [
          'authCode' => $auth_code,
          'msisdn' => $this->processUserPhone($user),
          'productID' => $price->sub_product_id,
        ];

        Log::debug('phonesub GET subscribeProductByAuthCode.do?'.http_build_query($params));

        $response = $this->phonesub()->get(
          'subscribeProductByAuthCode.do', $params
        );

        if ($response->successful()) {
            $xml = $this->parseXml($response);

            $resultCode = (string) $xml->resultCode;

            $result = 'unknown';
            switch ($resultCode) {
            case '000000':
                // Mark phone as verified after successful OTP verification
                $this->markPhoneAsVerified($user);

                if (app(Settings::class)->get('billing.phonesub_test_mode')) {
                    try {
                        $test_subscription_id = implode('-', ['phonesub', 'test', $this->processUserPhone($user), $price->sub_product_id, date('YmdHis')]);
                        if(!isset($test_subscription_id)) throw new Exception('No sub_product_id for this product');
                        $this->storeSubscriptionDetailsLocally($price->sub_product_id??0, $test_subscription_id, $user);
                        Log::debug('phonesub subscribeVerify test subscription: '.$test_subscription_id);
                    }
                    catch (\Exception $e) {
                        Log::debug('phonesub subscribeVerify test subscription fail: '.$e->getMessage());
                    }
                }

                return [
                    'status' => 'verified',
                    'message' => __('Your verification code has been validated successfully.'),
                ];

            case '330157':
                throw new GatewayException(__('Invalid verification code. Please try again.'));

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

    public function syncSubscriptionDetails(
        string $priceId,
        User $user
    ) {
        Log::debug('phonesub syncSubscriptionDetails: '.$priceId.' / '.$user->id);

        $price = Price::where(
          'id',
          $priceId,
        )->firstOrFail();

        $subscription = Subscription::where(
          'price_id', $priceId
        )->where(
          'user_id', $user->id
        )->orderByDesc('id')->firstOrFail();

        if ($subscription && $subscription->id) {
          return [
            'status' => 'success',
            'subscriptionId' => $subscription->id,
            'message' => __('You\'ve been successfully subscribed to the service.'),
          ];
        }

        return false;
    }

    public function cancelSubscription(
        Subscription $subscription,
        bool $atPeriodEnd = true
    ): bool {
        Log::debug('phonesub cancelSubscription: '.$subscription->toJson().' / '.($atPeriodEnd?'atPeriodEnd':'notPeriodEnd'));

        $params = [
          'msisdn' => $this->processUserPhone($subscription->user),
          'productID' => $subscription->price->sub_product_id,

          'Username' => config('services.phonesub.sp_id'),
          'Password' => md5(config('services.phonesub.sp_id').config('services.phonesub.password').$this->timestamp),

          'timestamp' => $this->timestamp,
          //'timestamp' => '20230904143853',
        ];

        $body = <<<BODY
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www.csapi.org/schema/parlayx/subscribe/manage/v1_0/local">
    <soapenv:Header>
        <tns:RequestSOAPHeader xmlns:tns="http://www.huawei.com.cn/schema/common/v2_1">
            <tns:spId>{$params['Username']}</tns:spId>
            <tns:spPassword>{$params['Password']}</tns:spPassword>
            <tns:timeStamp>{$params['timestamp']}</tns:timeStamp>
        </tns:RequestSOAPHeader>
    </soapenv:Header>
    <soapenv:Body>
        <loc:unSubscribeProductRequest>
            <loc:unSubscribeProductReq>
                <userID>
                    <ID>{$params['msisdn']}</ID>
                    <type>0</type>
                </userID>
                <subInfo>
                    <productID>{$params['productID']}</productID>
                    <operCode>zh</operCode>
                    <isAutoExtend>0</isAutoExtend>
                    <channelID>1</channelID>
                    <extensionInfo>
                        <namedParameters>
                            <key>keyword</key>
                            <value>unsub</value>
                        </namedParameters>
                    </extensionInfo>
                </subInfo>
            </loc:unSubscribeProductReq>
        </loc:unSubscribeProductRequest>
    </soapenv:Body>
</soapenv:Envelope>
BODY;

        Log::debug('phonesub POST SubscribeManage: '.http_build_query($params));

        $response = $this->phonesub('unsub')
          ->withBody($body, 'application/xml')
          ->post('SubscribeManage');

        if ($response->successful()) {
            $xml = $this->parseXml($response);

            $resultCode = (string) $this->extractXmlItem($response, ['result']);

            switch ($resultCode) {
            case '00000000':
              return true;
                return [
                    'status' => 'success',
                    'message' => __('Your subscription has been cancelled successfully.'),
                ];

            case '22007219':
                return true;
                return [
                    'status' => 'unsubscribed',
                    'message' => __('You\'ve already unsubscribed from the service.'),
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

        return true;
    }

    public function resumeSubscription(
        Subscription $subscription,
        array $gatewayParams = []
    ): bool {
        Log::debug('phonesub resumeSubscription: '.$subscription->toJson().' / '.json_encode($gatewayParams));
        throw new GatewayException(__('Could not renew subscription.'));
        return false;
    }

    public function processUserPhone(User|null $user, $newPhone = null): string {
        $processedPhone = preg_replace('/^\+/', '',  $newPhone ?? $user->phone);

        return $processedPhone;
    }

    public function parseXml(Response $response): SimpleXMLElement {
        $xml_string = $response->body();
        Log::debug('parsing xml response: '.$xml_string);

        return new SimpleXMLElement($xml_string);
    }
}
