<?php

namespace Common\Auth\Traits;

use App\Models\User;
use Illuminate\Support\Facades\Log;

trait HandlesPhoneVerification
{
    /**
     * Mark a user's phone number as verified
     */
    protected function markPhoneAsVerified(User $user): bool
    {
        try {
            $user->forceFill([
                'phone_verified' => true,
            ])->save();

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to mark phone as verified', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Check if a user's phone is verified
     */
    protected function isPhoneVerified(User $user): bool
    {
        return (bool) $user->phone_verified;
    }
}