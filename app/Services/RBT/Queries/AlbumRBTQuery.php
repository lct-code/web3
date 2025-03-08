<?php

namespace App\Services\RBT\Queries;

use App\Models\Album;
use App\Services\Albums\LoadAlbum;
use Illuminate\Database\Eloquent\Builder;

class AlbumRBTQuery extends BaseRBTQuery
{
    const ORDER_COL = 'number';
    const ORDER_DIR = 'asc';

    public function get(int $albumId): Builder
    {
        // fetch album RBT from spotify, if not fetched already
        (new LoadAlbum())->execute(Album::find($albumId), 'RBTQuery');

        return $this->baseQuery()->where('RBT.album_id', $albumId);
    }
}
