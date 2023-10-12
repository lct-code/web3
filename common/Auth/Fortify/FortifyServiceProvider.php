<?php

namespace Common\Auth\Fortify;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Fortify;
use Propaganistas\LaravelPhone\PhoneNumber;
use Illuminate\Support\Facades\Log;
use App\User;

class FortifyServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->instance(LoginResponseContract::class, new LoginResponse());
        $this->app->instance(
            LogoutResponseContract::class,
            new LogoutResponse(),
        );
        $this->app->instance(
            RegisterResponseContract::class,
            new RegisterResponse(),
        );
    }

    public function boot()
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        Fortify::authenticateUsing(function (Request $request) {
          Log::debug('login-fortify-auth '.json_encode($request->all()));

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
              return null;
          }

          if ($user) {
              return $user;
          }
        });

        RateLimiter::for('login', function (Request $request) {
            $phone = (string) $request->phone;
            return Limit::perMinute(5)->by($phone . $request->ip());
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by(
                $request->session()->get('login.id'),
            );
        });
    }
}
