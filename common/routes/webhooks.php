<?php

use Common\Billing\Gateways\Paypal\PaypalWebhookController;
use Common\Billing\Gateways\Phonesub\PhonesubWebhookController;
use Common\Billing\Gateways\Stripe\StripeWebhookController;
use Common\Billing\Gateways\Xceed\XceedWebhookController;
use Common\Billing\Gateways\Lebara\LebaraBillingWebhookController;
use Common\Billing\Gateways\Lebara\LebaraNotificationWebhookController;
use Illuminate\Support\Facades\Route;

// PAYPAL
Route::post('billing/paypal/webhook', [
    PaypalWebhookController::class,
    'handleWebhook',
]);

// STRIPE
Route::post('billing/stripe/webhook', [
    StripeWebhookController::class,
    'handleWebhook',
]);

// PHONESUB
Route::get('api/sync/zainksa', [
    PhonesubWebhookController::class,
    'handleWebhook',
]);
Route::post('api/sync/zainksa', [
    PhonesubWebhookController::class,
    'handleWebhook',
]);

// XCEED
Route::match(['get', 'post'], 'billing/xceed/webhook', [
    XceedWebhookController::class,
    'handleWebhook',
]);

// LEBARA
Route::match(['get', 'post'], 'billing/lebara/webhook', [
    LebaraBillingWebhookController::class,
    'handleWebhook',
]);
Route::match(['get', 'post'], 'billing/lebara/notification', [
    LebaraNotificationWebhookController::class,
    'handleWebhook',
]);
