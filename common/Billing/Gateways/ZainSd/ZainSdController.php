<?php namespace Common\Billing\Gateways\ZainSd;

use Common\Billing\Subscription;
use Common\Core\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ZainSdController extends BaseController
{
    public function __construct(
        protected Request $request,
        protected Subscription $subscription,
        protected ZainSd $zainSd
    ) {
        $this->middleware('auth')->except(['syncSubscriptionDetails']);
    }

    public function syncSubscriptionDetails(): Response|JsonResponse
    {
        $data = $this->validate($this->request, [
            'phone' => 'required|string',
            'product_code' => 'required|string',
        ]);

        try {
            $result = $this->zainSd->syncSubscriptionDetails(
                $data['phone'],
                $data['product_code']
            );
            
            return response()->json([
                'success' => true,
                'subscription' => $result['subscription'],
                'is_active' => $result['is_active'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => [
                    'message' => $e->getMessage(),
                ]
            ], 422);
        }
    }

    public function cancelSubscription(): Response|JsonResponse
    {
        $data = $this->validate($this->request, [
            'subscription_id' => 'required|string',
        ]);

        try {
            $subscription = $this->subscription
                ->where('id', $data['subscription_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $this->zainSd->cancelSubscription($subscription);
            
            // Load fresh user data with subscriptions
            $user = $subscription->user()->with('subscriptions.product')->first();

            return response()->json([
                'success' => true,
                'message' => __('Subscription cancelled successfully'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => [
                    'message' => $e->getMessage(),
                ]
            ], 422);
        }
    }
} 