<?php

namespace App\Listeners;

use Common\Auth\Events\UserCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\RewardLink;
use App\Models\RewardLinkTransaction;
use Illuminate\Support\Facades\Log;

class UserCreatedListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(UserCreated $event): void
    {
        $user = $event->user;

        $rewardCode = session()->get('reward_code');
        Log::debug("UserCreated: {$user->email}, Reward Code: {$rewardCode}");

        if ($rewardCode) {
            $rewardLink = RewardLink::where('reward_code', $rewardCode)->first();

            if ($rewardLink) {
                RewardLinkTransaction::create([
                    'reward_link_id' => $rewardLink->id,
                    'user_id' => $user->id,
                ]);

                Log::debug("Reward link transaction created for: {$user->email}, Reward Code: {$rewardCode}");
            }
        }
    }
}
