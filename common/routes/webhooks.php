<?php

use Common\Billing\Gateways\Paypal\PaypalWebhookController;
use Common\Billing\Gateways\Stripe\StripeWebhookController;
use Common\Billing\Gateways\Phonesub\PhonesubWebhookController;
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
Route::post('billing/phonesub/webhook', [
    PhonesubWebhookController::class,
    'handleWebhook',
]);
