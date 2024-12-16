<?php

namespace Common\Auth\Fortify;

use App\Models\User;
use Closure;
use Common\Auth\Actions\CreateUser;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Propaganistas\LaravelPhone\PhoneNumber;


class FortifyRegisterUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input): User
    {
        if (settings('registration.disable')) {
            abort(404);
        }
        if(settings('mobile_login')) {
            Validator::make($input, [
                'phone' => ['required', 'string', 'regex:/^0\d{9}$/', 'unique:users'],
            ])->validate();
                
            // skipp for now adding validation for phone number
            // $input['phone_entered'] = trim($input['phone']);
            // $phone = new PhoneNumber($input['phone_entered'], ['SA','INTERNATIONAL']);
            // $input['phone'] = $phone->formatE164();        
            $url_base = trim(substr(env('APP_URL'), strpos(env('APP_URL'), '//')+2), '/');
            if (empty($input['email'])) {
              $input['email'] = "{$input['phone']}@{$url_base}";
            }
            if (empty($input['password'])) {
              $input['password'] = "{$input['phone']}";
            }
            if (empty($input['name'])) {
              $input['name'] = $input['phone'];
            }
            return (new CreateUser())->execute($input);
        }   
        $appRules = config('common.registration-rules') ?? [];
        $commonRules = [
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
                function (string $attribute, mixed $value, Closure $fail) {
                    if (!self::emailIsValid($value)) {
                        $fail(__('This domain is blacklisted.'));
                    }
                },
            ],
            'password' => $this->passwordRules(),
            'token_name' => 'string|min:3|max:50',
        ];

        foreach ($appRules as $key => $rules) {
            $commonRules[$key] = array_map(function ($rule) {
                if (str_contains($rule, '\\')) {
                    $namespace = "\\$rule";
                    return new $namespace();
                }
                return $rule;
            }, $rules);
        }

        $data = Validator::make($input, $commonRules)->validate();

        return (new CreateUser())->execute($data);
    }

    public static function emailIsValid(string $email): bool
    {
        $blacklistedDomains = explode(
            ',',
            settings('auth.domain_blacklist', ''),
        );
        if ($blacklistedDomains) {
            $domain = explode('@', $email)[1] ?? null;
            if ($domain && in_array($domain, $blacklistedDomains)) {
                return false;
            }
        }

        return true;
    }
}
