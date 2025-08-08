<?php namespace Common\Billing\Gateways\Xceed;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class XceedWebhookController extends Controller
{
    public function handleWebhook(Request $request): Response
    {
        try {
            $payload = [
                'method' => $request->method(),
                'ip' => $request->ip(),
                'headers' => collect($request->headers->all())
                    ->map(fn ($v) => is_array($v) ? implode(', ', $v) : $v)
                    ->take(50) // prevent excessive log size
                    ->toArray(),
                'query' => $request->query(),
                'body' => $request->all(),
                'raw' => $request->getContent(),
            ];

            Log::info('Xceed webhook received', $payload);
        } catch (\Throwable $e) {
            Log::error('Something failed', [
                'message' => $e->getMessage(),
            ]);
        }

        return response('OK', 200);
    }
}


