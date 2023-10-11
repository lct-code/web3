<?php namespace Common\Billing\Gateways\Phonesub;

use App\User;
use Common\Billing\GatewayException;
use Common\Billing\Invoices\CreateInvoice;
use Common\Billing\Notifications\PaymentFailed;
use Common\Billing\Subscription;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Arr;
use Symfony\Component\HttpFoundation\Response;

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
        $payload = $request->all();

        switch ($payload['event_type']) {
            case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
                return $this->handleInvoicePaymentFailed($payload);
            case 'BILLING.SUBSCRIPTION.ACTIVATED':
                return $this->handleSubscriptionCreated($payload);
            case 'BILLING.SUBSCRIPTION.CANCELLED':
            case 'BILLING.SUBSCRIPTION.EXPIRED':
                return $this->handleSubscriptionCancelledOrExpired($payload);
            case 'PAYMENT.SALE.COMPLETED':
                return $this->handleSaleCompleted($payload);
            default:
                return response('Webhook Handled', 200);
        }
    }

    protected function handleInvoicePaymentFailed(array $payload): Response
    {
        $phonesubSubscriptionId = Arr::get(
            $payload,
            'resource.billing_agreement_id',
        );

        $subscription = $this->subscription
            ->where('gateway_id', $phonesubSubscriptionId)
            ->first();
        $subscription?->user->notify(new PaymentFailed($subscription));

        return response('Webhook handled', 200);
    }

    protected function handleSubscriptionCancelledOrExpired(
        array $payload
    ): Response {
        $phonesubSubscriptionId = $payload['resource']['id'];

        $subscription = $this->subscription
            ->where('gateway_id', $phonesubSubscriptionId)
            ->first();

        if ($subscription && !$subscription->cancelled()) {
            $subscription->markAsCancelled();
        }

        return response('Webhook Handled', 200);
    }

    /**
     * Handle a renewed stripe subscription.
     */
    protected function handleSaleCompleted(array $payload): Response
    {
        $gatewayId = Arr::get($payload, 'resource.billing_agreement_id');

        $subscription = $this->subscription
            ->where('gateway_id', $gatewayId)
            ->first();

        if ($subscription) {
            $phonesubSubscription = $this->gateway
                ->subscriptions()
                ->find($subscription);
            $subscription
                ->fill(['renews_at' => $phonesubSubscription['renews_at']])
                ->save();
            app(CreateInvoice::class)->execute([
                'subscription_id' => $subscription->id,
                'paid' => true,
            ]);
        }

        return response('Webhook Handled', 200);
    }

    protected function handleSubscriptionCreated(array $payload): Response
    {
        $phonesubSubscriptionId = Arr::get($payload, 'resource.id');
        $phonesubUserId = Arr::get($payload, 'resource.subscriber.payer_id');

        $user = User::where('phonesub_id', $phonesubUserId)->first();
        if ($user) {
            $this->phonesub->storeSubscriptionDetailsLocally(
                $phonesubSubscriptionId,
                $user,
            );
        }

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

