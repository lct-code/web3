<?php

namespace App\Http\Controllers;

use Common\Core\BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\RewardLink;

class RewardController extends BaseController
{
    public function storeRewardCode($code, Request $request)
    {
        $rewardCodeExists = RewardLink::where('reward_code', $code)->exists();

        if (!$rewardCodeExists) {
            Log::debug('Reward code not found: ' . $code);
            return redirect('/');
        }

        // fetch previous reward code from session
        $previousRewardCode = $request->session()->get('reward_code') ?? 'NULL';

        // store the reward code in the session
        $request->session()->put('reward_code', $code);

        // log the referral
        Log::debug("Reward code stored in session: $code (previously $previousRewardCode)");

        return redirect('/');
    }
}
