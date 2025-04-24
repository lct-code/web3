<?php

namespace App\Services\RBT\Queries;

use Illuminate\Database\Eloquent\Builder;

class PlaylistRBTQuery extends BaseRBTQuery
{
    const ORDER_COL = 'position';
    const ORDER_DIR = 'asc';

    public function get(int $playlistId, $params = []): Builder
    {
        return $this->baseQuery()
            ->join('playlist_RBT', 'RBT.id', '=', 'playlist_RBT.RBT_id')
            ->join('playlists', 'playlists.id', '=', 'playlist_RBT.playlist_id')
            ->where('playlists.id', '=', $playlistId)
            ->select('RBT.*', 'playlist_RBT.position as position');
    }
}
