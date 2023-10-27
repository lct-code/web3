<?php

namespace Common\Billing\Gateways\Phonesub;

use Carbon\Carbon;
use Common\Settings\Settings;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait InteractsWithPhonesubRestApi
{
    public function phonesub(): PendingRequest
    {
        // testing? app(Settings::class)->get('billing.phonesub_test_mode')
        $baseUrl = 'http://'.config('services.phonesub.address').'/portalservice/v1/interfaces/';

        $nonce = bin2hex(random_bytes(16));
        //$nonce = "MjAyMzA2MDcwODA2Mzk1MTQA";

        $timestamp = time();
        //$timestamp = 1686566956;

        $password_digest = base64_encode(sha1($nonce.$timestamp.config('services.phonesub.password'), true));

        Log::debug('InteractsWithPhonesubRestApi digest: '.$password_digest." / $nonce / $timestamp");

        $auth_params = [
          'Username' => config('services.phonesub.sp_id'),
          'PasswordDigest' => $password_digest,
          'Nonce' => $nonce,
          'Created' => $timestamp,
        ];
        $auth_header_parts = [];
        foreach ($auth_params as $auth_key => $auth_val) $auth_header_parts[] = "{$auth_key}=\"{$auth_val}\"";

        $auth_header = 'UsernameToken '.
          'Username="'.$auth_params['Username'].'", '.
          'PasswordDigest="'.$auth_params['PasswordDigest'].'", '.
          'Nonce="'.$auth_params['Nonce'].'",'.
          'Created="'.$auth_params['Created'].'"';

        $headers = [
          'x-hw-portal-type' => '2',
          'Authorization' => 'WSSE realm="SDP", profile="UsernameToken"',
          'X-WSSE' => $auth_header,
          'X-RequestHeader' => 'request clientID="'.config('services.phonesub.client_id').'"',
        ];

        /*
        $headers = json_decode('{
          "x-hw-portal-type": "2",
          "Authorization": "WSSE realm=\"SDP\", profile=\"UsernameToken\"",
          "X-WSSE": "UsernameToken Username=\"003201\", PasswordDigest=\"Vc5/gsEW6YQN4hJ7q2ShtC9jjBs=\", Nonce=\"MjAyMzA2MDcwODA2Mzk1MTQA\",Created=\"1686566956\"",
          "X-RequestHeader": "request clientID=\"003201000003200\""
        }', true);
         */

        Log::debug('InteractsWithPhonesubRestApi headers: '.json_encode($headers));

        return Http::withHeaders($headers)->baseUrl($baseUrl);
    }
}
