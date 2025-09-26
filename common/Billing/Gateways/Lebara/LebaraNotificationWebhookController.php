<?php

namespace Common\Billing\Gateways\Lebara;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Common\Files\FileEntryPayload;
use Common\Files\Actions\StoreFile;

class LebaraNotificationWebhookController extends Controller
{
    public function __construct(
        protected StoreFile $storeFile
    ) {}

    public function handleWebhook(Request $request): Response
    {
        // Retrieve query parameters from the URL (Lebara sends data as query params)
        $requestData = $request->query->all();

        $filename = date('Ymd-His') . '_lebara_notification.json';

        try {
            $jsonData = json_encode($requestData, JSON_PRETTY_PRINT);

            $payload = new FileEntryPayload([
                'name' => $filename,
                'clientMime' => 'application/json',
                'clientName' => $filename,
                'clientSize' => strlen($jsonData),
                'filename' => $filename,
                'diskPrefix' => 'webhook-logs/lebara',
                'visibility' => 'public',
                'public' => false, // This ensures it uses the 'uploads' disk instead of 'public'
            ]);
            // Use the existing StoreFile action with contents
            $stored = $this->storeFile->execute($payload, [
                'contents' => $jsonData,
            ]);

            if (!$stored) {
                Log::error('Lebara Notification Webhook: could not write file', [
                    'filename' => $filename,
                    'disk' => 'uploads',
                    'driver' => config('filesystems.disks.uploads.driver')
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Lebara Notification Webhook: failed to store file', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'config' => config('filesystems.disks.uploads')
            ]);
        }

        // Return 200 OK as requested
        return response('OK', 200);
    }
}
