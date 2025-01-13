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

        // Store sync data
        $storagePath = storage_path('sync/zainksa-'.date('Ymd-His').'.xml');
        if ($bytes = file_put_contents(
          $storagePath,
          $requestData,
        )) {
          Log::debug('phonesub api sync request: '.$bytes.' bytes wrote to '.$storagePath);
        }
        else {
          Log::debug('phonesub api sync request: could not write to '.$storagePath);
        }

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

        if (empty($requestData)) {
          return $this->respondXml(00000000, 'ok');
        }

        /*
        try {
          $xml = new SimpleXMLElement($requestData);
          $xml->registerXPathNamespace('ns1', 'https://www.w3.org/XML/2008/xsdl-exx/ns1');

          $event = (string) $xml->xpath('/soapenv:Envelope/soapenv:Body/ns1:syncOrderRelation/ns1:updateDesc');
        }
        catch (\Exception $e) {
          Log::debug('phonesub api sync - parse error: '.$e->getMessage());
          return $this->respondXml(500, 'Parse error');
        }
         */

        if (!($event = $this->extractXmlItem($requestData, 'ns1:updateDesc'))) {
          return $this->respondXml(100, 'Missing event');
        }

        switch ($event) {
            case 'Addition':
                return $this->handleSubscription($requestData);
            case 'Deletion':
                return $this->handleUnsubscription($requestData);
            case 'Renewal':
                return $this->handleRenewal($requestData);
        }

        Log::debug('phonesub api sync - unknown event: '.$event);
        return $this->respondXml(100, 'Unknown event');
    }

    protected function respondXml($code, $desc = 'OK') {
      // Create the SOAP response
      $responseXml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:loc="http://www..."></soapenv:Envelope>');

      $body = $responseXml->addChild('soapenv:Body');
      $syncOrderRelationResponse = $body->addChild('loc:syncOrderRelationResponse');
      $syncOrderRelationResponse->addChild('loc:result', $code);
      $syncOrderRelationResponse->addChild('loc:resultDescription', $desc);

      return response($responseXml->asXml(), 200, [
        'Content-Type' => 'application/xml'
      ]);
    }

    protected function handleSubscription(string $xmlString): Response
    {
        $phonesubProductId = $this->extractXmlItem($xmlString, ['ns1:productID']);
        $phonesubUserId = $this->extractXmlItem($xmlString, ['ns1:userID','ID']);
        // $phonesubSubscriptionId = $this->extractXmlItem($xmlString, ['ns1:serviceID']);

        // generating unique subscription ID because we're not getting one from Zain
        $phonesubSubscriptionId = implode('-', ['phonesub', $phonesubUserId, $phonesubProductId, date('YmdHis')]);

        Log::debug('phonesub api sync - handleSubscription: '.$phonesubProductId.' / '.$phonesubUserId.' / '.$phonesubSubscriptionId);
        if (!$phonesubProductId || !$phonesubUserId || !$phonesubSubscriptionId) {
            return $this->respondXml(400, 'Missing SUB data');
        }

        try {
            $user = User::where('phone', '+'.$phonesubUserId)->firstOrFail();
        }
        catch (\Exception $e) {
            Log::debug('phonesub api sync - handleSubscription - user NOT FOUND for phone: '.$phonesubUserId);
            return $this->respondXml(400, 'Missing User data');
        }

        Log::debug('phonesub api sync - handleSubscription - user: '.json_encode($user));

        try {
            $this->phonesub->storeSubscriptionDetailsLocally($phonesubProductId, $phonesubSubscriptionId, $user);
        }
        catch (\Exception $e) {
            Log::debug('phonesub api sync - handleSubscription - storeSubscriptionDetailsLocally error: '.$e->getMessage());
            return $this->respondXml(400, 'Could not store subscription');
        }

        return $this->respondXml(0, 'OK');
    }

    protected function handleUnsubscription(string $xmlString): Response
    {
        $phonesubProductId = $this->extractXmlItem($xmlString, ['ns1:productID']);
        $phonesubUserId = $this->extractXmlItem($xmlString, ['ns1:userID','ID']);
        //$phonesubSubscriptionId = $this->extractXmlItem($xmlString, ['ns1:serviceID']);

        $phonesubSubscriptionIdStub = implode('-', ['phonesub', $phonesubUserId, $phonesubProductId]);
        Log::debug('phonesub api sync - handleUnsubscription: '.$phonesubUserId.' / '.$phonesubSubscriptionIdStub);

        if (!$phonesubProductId || !$phonesubUserId || !$phonesubSubscriptionIdStub) {
            return $this->respondXml(400, 'Missing SUB data');
        }

        $subscription = Subscription::where(
            'gateway_id',
            'LIKE',
            $phonesubSubscriptionIdStub.'%'
        )->orderBy('created_at', 'desc')->first();

        Log::debug('phonesub api sync - handleUnsubscription - $subscription: '.json_encode($subscription));

        $subscription?->cancelAndDelete();

        return $this->respondXml(0, 'OK');
    }

    protected function handleRenewal(string $xmlString): Response
    {
        $phonesubProductId = $this->extractXmlItem($xmlString, ['ns1:productID']);
        $phonesubUserId = $this->extractXmlItem($xmlString, ['ns1:userID','ID']);
        //$phonesubSubscriptionId = $this->extractXmlItem($xmlString, ['ns1:serviceID']);

        $phonesubSubscriptionIdStub = implode('-', ['phonesub', $phonesubUserId, $phonesubProductId]);
        Log::debug('phonesub api sync - handleRenewal (TODO): '.$phonesubUserId.' / '.$phonesubSubscriptionIdStub);

        if (!$phonesubProductId || !$phonesubUserId || !$phonesubSubscriptionIdStub) {
            return $this->respondXml(400, 'Missing SUB data');
        }

        return $this->respondXml(0, 'OK');
    }
}

