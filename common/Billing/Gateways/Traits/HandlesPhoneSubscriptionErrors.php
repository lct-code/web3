<?php

namespace Common\Billing\Gateways\Traits;

use Common\Billing\GatewayException;
use Illuminate\Support\Facades\Log;

trait HandlesPhoneSubscriptionErrors
{
    protected function handleCommonPhoneErrors(
        array|string $errorCode,
        string $context,
        array $errorMap = [],
        array $metadata = [],
        string $message = ""
    ): void {
        $defaultErrorMap = [
            'INVALID_PHONE' => __('Phone number entered is invalid. Please try again.'),
            'ALREADY_SUBSCRIBED' => __('You\'re already subscribed to the service.'),
            'INVALID_AUTH' => __('Invalid verification code. Please try again.'),
            'AUTH_EXPIRED' => __('The verification code has expired. You can request a new code.'),
            'NOT_SUBSCRIBED' => __('This number is not subscribed to this service'),
            'SUBSCRIPTION_INACTIVE' => __('Subscription is currently inactive'),
            'VERIFICATION_FAILED' => __('Could not verify subscription status. Please try again later'),
            'ALREADY_UNSUBSCRIBED' => __('You\'ve already unsubscribed from the service.'),
            'SUCCESS' => __('Operation completed successfully.'),
            'SUCCESS_UNSUBSCRIBE' => __('Your subscription has been cancelled successfully.'),
        ];

        $errorMap = array_merge($defaultErrorMap, $errorMap);

        // Log the error with context
        Log::error("Phone subscription error in {$context}", [
            'error_code' => $errorCode,
            'gateway' => static::class,
            ...$metadata
        ]);

        // Map error code to message or use default
        $errorMessage = $errorMap[$errorCode] ?? $message ?? __('Could not complete the request. Please try again later');

        throw new GatewayException($errorMessage);
    }

    protected function mapPhonesubErrorCode(string $code): string
    {
        return match ($code) {
            '330070', '310001' => 'INVALID_PHONE',
            '330040' => 'ALREADY_SUBSCRIBED',
            '330157' => 'INVALID_AUTH',
            '330158' => 'AUTH_EXPIRED',
            '000000' => 'SUCCESS',
            '22007219' => 'ALREADY_UNSUBSCRIBED',
            '00000000' => 'SUCCESS_UNSUBSCRIBE',
            default => 'UNKNOWN_ERROR'
        };
    }

    protected function mapZainSdErrorCode(string $code): string
    {
        return match ($code) {
            '102' => 'INVALID_PHONE',
            '113' => 'ALREADY_SUBSCRIBED',
            '111' => 'NOT_SUBSCRIBED',
            '118' => 'SUBSCRIPTION_INACTIVE',
            '1000', '1003' => 'VERIFICATION_FAILED',
            default => 'UNKNOWN_ERROR'
        };
    }
}