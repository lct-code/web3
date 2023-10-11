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
use Illuminate\Validation\ValidationException;
use Session;
use Common\Billing\Models\Price;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input): User
    {
        if (app(Settings::class)->get('registration.disable')) {
            abort(404);
        }
        Log::debug('receiving reg data: '.json_encode($input));

        // preprocess phone number
        if (!empty($input['phone'])) {
            // save phone number in user-entered format
            $input['phone_entered'] = trim($input['phone']);

            try {
                // process phone number
                $phone = new PhoneNumber($input['phone_entered'], ['SA','INTERNATIONAL']);

                // convert to E.164 format for persistance
                $input['phone'] = $phone->formatE164();
            }
            catch (\Exception $e) {
                throw ValidationException::withMessages([
                    'phone' => ['Invalid phone number format. Please make sure to enter a valid phone number in the KSA code format.'],
                ]);
            }
        }

        Validator::make($input, [
            'phone' => [
                'required',
                'string',
                'max:255',
            ],
            'subscription' => [
                'string',
            ]
        ])->validate();
        Log::debug('validated reg data: '.json_encode($input));

        if (!empty($input['subscription'])) {
            // fetch price model
            $price = Price::where(
                'sub_product_id',
                $input['subscription'],
            )->first();

            Log::debug('regitration with subscription: '.$input['subscription'].' / '.json_encode($price));

            if (!empty($price)) {
                Session::flash('registerRedirectUri', "/checkout/{$price->product_id}/{$price->id}");
            }
        }

        // fetch existing user model
        $existing_user = User::where(
            'phone',
            $input['phone'],
        )->first();

        if (!empty($existing_user)) {
            Session::flash('message', 'You\'ve been logged in to your previously registered account.');
            return $existing_user;
        }

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

        Log::debug('inserting new user: '.json_encode($input));

        return app(UserRepository::class)->create($input);
    }
}
