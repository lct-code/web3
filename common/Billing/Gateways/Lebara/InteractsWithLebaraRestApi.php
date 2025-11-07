<?php

namespace Common\Billing\Gateways\Lebara;

use Common\Billing\GatewayException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait InteractsWithLebaraRestApi
{
    /**
     * Create HTTP client for Lebara API requests
     *
     * @param string $httpMethod The HTTP method (get, post, put, etc.)
     * @param string $apiMethod The API method (users.subscribe_pincode, etc.)
     * @param array $additionalParams Additional query parameters
     * @return PendingRequest
     */
    public function lebara(string $httpMethod, string $apiMethod, array $additionalParams = []): PendingRequest
    {
        $baseUrl = config('services.lebara.base_url');
        $apiVersion = config('services.lebara.api_version', 'v1.1');
        $apiKey = config('services.lebara.api_key');

        if (empty($baseUrl)) {
            throw new GatewayException(__('Missing Lebara base URL configuration.'));
        }

        if (empty($apiKey)) {
            throw new GatewayException(__('Missing Lebara API key configuration.'));
        }

        // Build the full URL
        $url = $baseUrl . '/en/api/' . $httpMethod . '/' . $apiVersion . '/' . $apiMethod;

        // Prepare query parameters
        $queryParams = array_merge($additionalParams, [
            'api_key' => $apiKey,
        ]);

        Log::debug('Lebara API request: ' . $url . '?' . http_build_query($queryParams));

        return Http::baseUrl($url)->withQueryParameters($queryParams);
    }

    /**
     * Parse Lebara API response
     *
     * @param \Illuminate\Http\Client\Response $response
     * @return array
     * @throws GatewayException
     */
    public function parseLebaraResponse($response): array
    {
        if (!$response->successful()) {
            Log::error('Lebara API error response: ' . $response->status() . ' - ' . $response->body());
            throw new GatewayException(__('Lebara API request failed with status: :status', ['status' => $response->status()]));
        }

        $data = $response->json();

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Lebara API invalid JSON response: ' . $response->body());
            throw new GatewayException(__('Invalid JSON response from Lebara API'));
        }

        // Check for API-level errors
        if (isset($data['error']) && $data['error'] !== false) {
            Log::error('Lebara API business error: ' . json_encode($data));
            throw new GatewayException(__('Lebara API error: :message', ['message' => $data['message'] ?? 'Unknown error']));
        }

        Log::debug('Lebara API success response: ' . json_encode($data));

        return $data;
    }
}
