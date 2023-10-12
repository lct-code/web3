<?php

namespace Common\Auth\Controllers;

use App\User;
use Common\Core\BaseController;
use Common\Core\Bootstrap\MobileBootstrapData;
use Common\Settings\Settings;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Fortify;
use Propaganistas\LaravelPhone\PhoneNumber;
use Illuminate\Support\Facades\Log;

class MobileAuthController extends BaseController
{
    public function login(Request $request)
    {
        Log::debug('login-controller '.json_encode($request->all()));

        $this->validate($request, [
            'phone' => 'required|string',
            'token_name' => 'required|string|min:3|max:100',
        ]);

        $user = null;

        try {
          // fetch entered phone number
          $phone_entered = $request->get('phone');

          // process phone number
          $phone = new PhoneNumber($phone_entered, ['SA','INTERNATIONAL']);

          // convert to E.164 format for lookup
          $phone_formatted = $phone->formatE164();

          // fetch user model
          $user = User::where(
            'phone',
            $phone_formatted,
          )->first();
        }
        catch (\Exception $e) {
            Log::debug('login-exception-response');
            throw ValidationException::withMessages([
                'phone' => [trans('validation.phone')],
            ]);
        }

        Log::debug('login-data '.json_encode([$phone_entered, $phone_formatted, $user]));

        if (
            !$user
        ) {
            // @TODO this won't be called
            if (!empty($phone_formatted)) {
                $uri = '/register?phone='.$phone_formatted;
                Log::debug('login-redirect-response: '.$uri);
                return response()->json([
                    'result' => 'register',
                    'redirectUri' => $uri,
                ], 422);
            }

            Log::debug('login-fail-response');
            throw ValidationException::withMessages([
                'phone' => [trans('auth.failed')],
            ]);
        }

        if (app(Settings::class)->get('single_device_login')) {
            Auth::logoutOtherDevices($request->get('password'));
        }

        Auth::login($user);

        $bootstrapData = app(MobileBootstrapData::class)
            ->init()
            ->refreshToken($request->get('token_name'))
            ->get();

        return $this->success($bootstrapData);
    }

    public function register(
        Request $request,
        CreatesNewUsers $creator
    ): RegisterResponse {
        event(new Registered(($user = $creator->create($request->all()))));

        Auth::login($user);

        return app(RegisterResponse::class);
    }
}
