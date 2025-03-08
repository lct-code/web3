<?php

namespace Common\Billing\Gateways\ZainSd;

use Carbon\Carbon;
use Common\Settings\Settings;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Common\Billing\GatewayException;
use Illuminate\Support\Facades\Log;

trait InteractsWithZainSdRestApi
{
    protected string $tokenFile = '../common/Billing/Gateways/ZainSd/dsp.txt';
    private function getTokenDataFromFile(): ?array
    {
        try {
            $tokenFileContent = file_get_contents($this->tokenFile);
        } catch (\Exception $e) {
            Log::error('Error reading token file', ['error' => $e->getMessage()]);
            return [
                'accessToken' => null,
                'tokenExpires' => null,
            ];
        }

        if (!$tokenFileContent) {
            return [
                'accessToken' => null,
                'tokenExpires' => null,
            ];
        }

        try {
            
            $tokenParts = explode('~~~', $tokenFileContent);

            if (count($tokenParts) !== 2) {
                return [
                    'accessToken' => null,
                    'tokenExpires' => null,
                ];
            }
            return [
                'accessToken' => $tokenParts[0],
                'tokenExpires' => Carbon::parse($tokenParts[1]),
            ];
        } catch (\Exception $e) {
            Log::error('Error parsing token expires', ['error' => $e->getMessage()]);
            return [
                'accessToken' => null,
                'tokenExpires' => null,
            ];
        }
    }
    public function zainSd(): PendingRequest
    {
        $baseUrl = config('services.zain_sd.baseurl');
        $token = $this->getTokenDataFromFile();

        if (!$baseUrl) {
            throw new GatewayException('Missing Zain SD base URL');
        }
        // save the access token in a file and read it from there
        if (!$token['accessToken'] || $token['tokenExpires']->isPast()) {
            Log::debug("Access Token Not Found");
            $response = Http::post("$baseUrl/v1/json/login.php", [
                'username' => config('services.zain_sd.client_username'),
                'password' => config('services.zain_sd.client_password'),
                'remember_me' => true,
            ]);

            if (!$response->successful()) {
                throw new GatewayException('Could not authenticate with Zain SD');
            }

            $token['accessToken'] = $response['token'];
            $token['tokenExpires'] = Carbon::now()->addDays(29);
            // I want to create a file if it doesn't exist and remove everything on it if it was created before writing 
            file_put_contents($this->tokenFile, $token['accessToken'].'~~~'.$token['tokenExpires']->format('Y-m-d H:i:s').PHP_EOL, LOCK_EX);
        }

        return Http::withToken($token['accessToken'])->baseUrl($baseUrl);
    }

    protected function processUserPhone(string $phone): string 
    {
        // Remove any '+' prefix and spaces
        return preg_replace('/[^0-9]/', '', $phone);
    }
} 