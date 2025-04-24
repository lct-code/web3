<?php

namespace App\Services\RBT\Queries;

use App\Models\Artist;
use App\Services\Artists\SyncArtistWithSpotify;
use Illuminate\Database\Eloquent\Builder;

class ArtistRBTQuery extends BaseRBTQuery
{
    const ORDER_COL = 'spotify_popularity';

    public function get(int $artistId): Builder
    {
        $artist = Artist::find($artistId);

        if ($artist && $artist->needsUpdating()) {
            (new SyncArtistWithSpotify())->execute($artist);
        }

        return $this->baseQuery()
            ->join('artist_r_b_t', 'RBT.id', '=', 'artist_r_b_t.RBT_id')
            ->where('artist_r_b_t.artist_id', $artistId)
            ->select('RBT.*');
    }
}
