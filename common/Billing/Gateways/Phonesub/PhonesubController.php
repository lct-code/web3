<?php namespace Common\Billing\Gateways\Phonesub;

use Common\Billing\Subscription;
use Common\Core\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class PhonesubController extends BaseController
{
    public function __construct(
        protected Request $request,
        protected Subscription $subscription,
        protected Phonesub $phonesub
    ) {
        $this->middleware('auth');
    }

    public function subscribeStart(): JsonResponse
    {
        $data = $this->validate($this->request, [
            'price_id' => 'required|string',
            'phone' => 'required|string',
        ]);

        try {
            $data = $this->phonesub->subscribeStart(
                $data['price_id'],
                $data['phone'],
                $this->request->user(),
            );
        }
        catch (\Exception $e) {
            return response()->json(['error' => ['message'=>$e->getMessage(),'type'=>'gateway']]);
        }

        return response()->json($data);
    }

    public function subscribeVerify(): JsonResponse
    {
        $data = $this->validate($this->request, [
            'price_id' => 'required|string',
            'auth_code' => 'required|string',
        ]);

        try {
            $data = $this->phonesub->subscribeVerify(
                $data['price_id'],
                Auth::user(),
                $data['auth_code'],
            );
        }
        catch (\Exception $e) {
            return response()->json(['error' => ['message'=>$e->getMessage()]]);
        }

        return response()->json($data);
    }

    public function syncSubscriptionDetails(): Response|JsonResponse
    {
        $data = $this->validate($this->request, [
            'price_id' => 'required|string',
        ]);

        try {
            $data = $this->phonesub->syncSubscriptionDetails(
                $data['price_id'],
                Auth::user(),
            );
        }
        catch (\Exception $e) {
            return response()->json(['error' => ['message'=>$e->getMessage()]], 422);
        }

        return response()->json($data);
    }
}
