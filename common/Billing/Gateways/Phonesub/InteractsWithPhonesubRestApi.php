<?php

namespace Common\Billing\Gateways\Phonesub;

use Carbon\Carbon;
use Common\Settings\Settings;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

trait InteractsWithPhonesubRestApi
{
    public function phonesub(): PendingRequest
    {
        // testing? app(Settings::class)->get('billing.phonesub_test_mode')
        $baseUrl = 'http://'.config('services.phonesub.address').'/portalservice/v1/interfaces/';

        $nonce = bin2hex(random_bytes(16));
        $timestamp = time();
        $password_digest = base64_encode(sha1($nonce.$timestamp.config('services.phonesub.password'), true));

        $auth_header = 'UsernameToken ';
        $auth_params = [
          'Username' => config('services.phonesub.sp_id'),
          'PasswordDigest' => $password_digest,
          'Nonce' => $nonce,
          'Created' => gmdate('Y-m-d\TH:i:s\Z', $timestamp)
        ];
        foreach ($auth_params as $auth_key => $auth_val) $auth_header .= ",{$auth_key}=\"{$auth_val}\"";

        $headers = [
          'x-hw-portal-type' => '2',
          'Authorization' => 'WSSE realm="SDP", profile="UsernameToken"',
          'X-WSSE' => $auth_header,
          'X-Request-Header' => 'request clientID="'.config('services.phonesub.client_id').'"',
        ];

        return Http::withHeaders($headers)->baseUrl($baseUrl);
    }
}
