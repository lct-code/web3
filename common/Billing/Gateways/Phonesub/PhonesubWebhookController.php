<?php namespace Common\Billing\Gateways\Phonesub;

use App\User;
use Common\Billing\GatewayException;
use Common\Billing\Invoices\CreateInvoice;
use Common\Billing\Notifications\PaymentFailed;
use Common\Billing\Subscription;
use Common\Billing\Models\Price;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use SimpleXMLElement;

class PhonesubWebhookController extends Controller
{
    use InteractsWithPhonesubRestApi;

    public function __construct(
        protected Subscription $subscription,
        protected Phonesub $phonesub
    ) {
    }

    public function handleWebhook(Request $request): Response
    {
        // Retrieve incoming request data
        $requestData = file_get_contents('php://input');

        $headers = [];
        foreach ($_SERVER as $key => $value) {
          if (substr($key, 0, 5) == 'HTTP_') {
            $headers[$key] = $value;
          }
        }

        Log::debug('phonesub api sync request: '.json_encode([
            'method' => $_SERVER['REQUEST_METHOD'],
            'request' => $_REQUEST,
            'headers' => $headers,
        ]));
        Log::debug('phonesub api sync - parsing xml data: '.$requestData);

        $xml = new SimpleXMLElement($requestData);

        $event = (string) $xml->xpath('/soapenv:Envelope/soapenv:Body/ns1:syncOrderRelation/ns1:updateDesc');

        switch ($event) {
            case 'Addition':
                return $this->handleSubscription($xml);
            case 'Deletion':
                return $this->handleUnsubscription($xml);
            case 'Renewal':
                return $this->handleRenewal($xml);
        }

        Log::debug('phonesub api sync - unknown event: '.$event);
        return response('Webhook Handled', 200);
    }

    protected function handleSubscription(SimpleXmlElement $xml): Response
    {
        $phonesubProductId = (string) $xml->xpath('/soapenv:Envelope/soapenv:Body/ns1:syncOrderRelation/ns1:productID');
        $phonesubUserId = (string) $xml->xpath('/soapenv:Envelope/soapenv:Body/ns1:syncOrderRelation/ns1:UserID/ID');
        $phonesubSubscriptionId = (string) $xml->xpath('/soapenv:Envelope/soapenv:Body/ns1:syncOrderRelation/ns1:serviceID');

        Log::debug('phonesub api sync - handleSubscription: '.$phonesubProductId.' / '.$phonesubUserId.' / '.$phonesubSubscriptionId);

        $user = User::where('phone', $phonesubUserId)->firstOrFail();

        $this->phonesub->storeSubscriptionDetailsLocally($phonesubProductId, $user, $phonesubSubscriptionId);

        return response('Webhook Handled', 200);
    }

    protected function handleUnsubscription(SimpleXmlElement $xml): Response
    {
        $phonesubUserId = (string) $xml->xpath('/soapenv:Envelope/soapenv:Body/ns1:syncOrderRelation/ns1:UserID/ID');
        $phonesubSubscriptionId = (string) $xml->xpath('/soapenv:Envelope/soapenv:Body/ns1:syncOrderRelation/ns1:serviceID');
        Log::debug('phonesub api sync - handleUnsubscription: '.$phonesubUserId.' / '.$phonesubSubscriptionId);

        return response('Webhook Handled', 200);
    }

    protected function handleRenewal(SimpleXmlElement $xml): Response
    {
        $phonesubUserId = (string) $xml->xpath('/soapenv:Envelope/soapenv:Body/ns1:syncOrderRelation/ns1:UserID/ID');
        $phonesubSubscriptionId = (string) $xml->xpath('/soapenv:Envelope/soapenv:Body/ns1:syncOrderRelation/ns1:serviceID');
        Log::debug('phonesub api sync - handleRenewal: '.$phonesubUserId.' / '.$phonesubSubscriptionId);

        return response('Webhook Handled', 200);
    }

    protected function webhookIsValid(): bool
    {
        $payload = [
            'auth_algo' => request()->header('phonesub-AUTH-ALGO'),
            'cert_url' => request()->header('phonesub-CERT-URL'),
            'transmission_id' => request()->header('phonesub-TRANSMISSION-ID'),
            'transmission_sig' => request()->header('phonesub-TRANSMISSION-SIG'),
            'transmission_time' => request()->header(
                'phonesub-TRANSMISSION-TIME',
            ),
            'webhook_id' => config('services.phonesub.webhook_id'),
            'webhook_event' => request()->all(),
        ];

        $response = $this->phonesub()->post(
            'notifications/verify-webhook-signature',
            $payload,
        );

        if (!$response->successful()) {
            throw new GatewayException(
                "Could not validate phonesub webhook: {$response->body()}",
            );
        }

        return $response['verification_status'] === 'SUCCESS';
    }
}

