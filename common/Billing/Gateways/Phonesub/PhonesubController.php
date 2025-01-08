<?php namespace Common\Billing\Gateways\Phonesub;

use App\Models\User;
use Common\Auth\Fortify\FortifyRegisterUser;
use Common\Billing\Subscription;
use Common\Core\BaseController;
use Common\Core\Bootstrap\BaseBootstrapData;
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
            // Login/register the user with the phone number
            if ($this->request->user()?->phone != $data['phone']) {
                $user = User::where('phone', $data['phone'])->first();
                if (!$user) {
                    $user = app(FortifyRegisterUser::class)->create([
                        'phone' => $data['phone'],
                    ], true);
                }
                $this->switchUsers($user,$this->request->user()); 
            }   
        } catch (\Exception $e) {
            return response()->json(['error' => ['message'=>$e->getMessage(),'type'=>'gateway']]);
        }

        return response()->json($data);
    }

    public function subscribeVerify(): JsonResponse
    {
        $this->middleware('auth');

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
        $this->middleware('auth');

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
}
