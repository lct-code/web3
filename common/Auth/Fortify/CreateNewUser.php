<?php

namespace Common\Auth\Fortify;

use App\User;
use Common\Auth\UserRepository;
use Common\Settings\Settings;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Propaganistas\LaravelPhone\PhoneNumber;
use Illuminate\Support\Facades\Log;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input): User
    {
        if (app(Settings::class)->get('registration.disable')) {
            abort(404);
        }
        
        Validator::make($input, [
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'token_name' => 'string|min:3|max:50',
        ])->validate();

        return app(UserRepository::class)->create($input);
    }

    public function createMobile(array $input): User
    {
        if (app(Settings::class)->get('registration.disable')) {
            abort(404);
        }
        Validator::make($input, [
            'phone' => [
              'required',
              'string',
              'max:255',
              Rule::unique(User::class),
            ],
        ], [
          'phone' => 'Invalid phone number format. Please make sure to enter a valid phone number in the KSA code format.',
        ])->validate();

        // preprocess phone number, auto-fill email & password fields
        if (!empty($input['phone'])) {
            // save phone number in user-entered format
            $input['phone_entered'] = trim($input['phone']);
            try {
              // process phone number
              $phone = new PhoneNumber($input['phone_entered'], ['SA','INTERNATIONAL']);
              // convert to E.164 format for persistance
              $input['phone'] = $phone->formatE164();
              // generate email and password values
              $phone_token = trim($input['phone'], '+');
              $url_base = trim(substr(env('APP_URL'), strpos(env('APP_URL'), '//')+2), '/');
              if (empty($input['email'])) {
                $input['email'] = "{$phone_token}@{$url_base}";
              }
              if (empty($input['password'])) {
                $input['password'] = "{$phone_token}-secret";
              }
              if (empty($input['name'])) {
                $input['name'] = $phone_token;
              }
            }
            catch (\Exception $e) {
              /*
              throw ValidationException::withMessages([
                  'phone' => [trans('validation.phone')],
              ]);
               */
            }
            xdebug_break();
          }
          Log::debug('inserting new user: '.json_encode($input));

        return app(UserRepository::class)->create($input);
    }
}
