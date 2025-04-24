<?php

namespace App\Policies;

use App\Models\RBT;
use App\Models\User;
use Common\Core\Policies\BasePolicy;
use Common\Settings\Settings;
use Illuminate\Database\Eloquent\Builder;

class RBTPolicy extends BasePolicy
{
    public function index(?User $user)
    {
        return $this->hasPermission($user, 'RBT.view') ||
            $this->hasPermission($user, 'music.view');
    }

    public function show(?User $user, RBT $RBT)
    {
        if ($RBT->owner_id === $user->id) {
            return true;
        } elseif (
            $this->hasPermission($user, 'RBT.view') ||
            $this->hasPermission($user, 'music.view')
        ) {
            return true;
        } elseif ($user) {
            $managedArtists = $user->artists()->pluck('artists.id');
            $RBTArtists = $RBT->artists->pluck('pivot.artist_id');
            return $RBTArtists->intersect($managedArtists)->isNotEmpty();
        }
        return false;
    }

    public function store(User $user)
    {
        // user can't create RBT at all
        if (
            !$this->hasPermission($user, 'RBT.create') &&
            !$this->hasPermission($user, 'music.create')
        ) {
            return false;
        }

        // user is admin, can ignore count restriction
        if ($this->hasPermission($user, 'admin')) {
            return true;
        }

        // user does not have any restriction on RBT minutes
        $maxMinutes = $user->getRestrictionValue('music.create', 'minutes');
        if (is_null($maxMinutes)) {
            return true;
        }

        $usedMS = $user->uploadedRBT()->sum('duration');
        $usedMinutes = floor($usedMS / 60000);

        // check if user did not go over their max quota
        if ($usedMinutes >= $maxMinutes) {
            $this->deny(__('policies.minutes_exceeded'), [
                'showUpgradeButton' => true,
            ]);
        }

        return true;
    }

    public function update(User $user, RBT $RBT)
    {
        if ($RBT->owner_id === $user->id) {
            return true;
        } elseif (
            $this->hasPermission($user, 'RBT.update') ||
            $this->hasPermission($user, 'music.update')
        ) {
            return true;
        } elseif ($user) {
            $managedArtists = $user->artists()->pluck('artists.id');
            $RBTArtists = $RBT->artists->pluck('pivot.artist_id');
            return $RBTArtists->intersect($managedArtists)->isNotEmpty();
        }
        return false;
    }

    public function destroy(User $user, $RBTIds)
    {
        if (
            $this->hasPermission($user, 'RBT.delete') ||
            $this->hasPermission($user, 'music.delete')
        ) {
            return true;
        } else {
            $managedArtists = $user->artists()->pluck('artists.id');
            $dbCount = RBT::whereIn('RBT.id', $RBTIds)
                ->where(function (Builder $builder) use (
                    $user,
                    $managedArtists,
                    $RBTIds,
                ) {
                    $builder->where('owner_id', $user->id)->orWhereHas(
                        'artists',
                        function (Builder $builder) use ($managedArtists) {
                            $builder->whereIn('artists.id', $managedArtists);
                        },
                        '=',
                        count($RBTIds),
                    );
                })
                ->count();
            return $dbCount === count($RBTIds);
        }
    }

    public function download(?User $user, RBT $RBT)
    {
        return app(Settings::class)->get('player.enable_download') &&
            $this->hasPermission($user, 'music.download');
    }
}
