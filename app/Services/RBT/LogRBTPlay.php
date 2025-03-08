<?php

namespace App\Services\RBT;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use App\Models\RBT;
use App\Models\RBTPlay;
use Auth;
use Carbon\Carbon;
use Jenssegers\Agent\Agent;

class LogRBTPlay
{
    public function execute(RBT $RBT, ?string $queueId): ?RBTPlay
    {
        // only log play every minute for same RBT and user
        $existing = $RBT
            ->plays()
            ->whereBetween('created_at', [
                Carbon::now()->subMinute(),
                Carbon::now(),
            ])
            ->where('user_id', Auth::id())
            ->first();
        if (!$existing) {
            return $this->log($RBT, $queueId);
        }
        return null;
    }

    private function log(RBT $RBT, ?string $queueId): RBTPlay
    {
        $agent = app(Agent::class);
        $attributes = [
            'location' => $this->getLocation(),
            'platform' => strtolower($agent->platform()),
            'device' => $this->getDevice(),
            'browser' => strtolower($agent->browser()),
            'user_id' => Auth::id(),
        ];

        $RBTPlay = $RBT->plays()->create($attributes);

        RBT::where('id', $RBT->id)->increment('plays');
        if ($RBT->album_id) {
            Album::where('id', $RBT->album_id)->increment('plays');
        }
        $artistIds = $RBT->artists->pluck('id');
        if ($artistIds->isNotEmpty()) {
            Artist::whereIn('id', $artistIds)->increment('plays');
        }

        [$modelType, $modelId] = array_pad(explode('.', $queueId), 2, null);
        if ($modelType === Playlist::MODEL_TYPE) {
            Playlist::where('id', $modelId)->increment('plays');
        }

        return $RBTPlay;
    }

    private function getDevice(): string
    {
        $agent = app(Agent::class);
        if ($agent->isMobile()) {
            return 'mobile';
        } elseif ($agent->isTablet()) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    private function getLocation(): string
    {
        return strtolower(geoip(getIp())['iso_code']);
    }
}
