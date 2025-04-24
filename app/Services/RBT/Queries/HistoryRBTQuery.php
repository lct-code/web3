<?php

namespace App\Services\RBT\Queries;

use Illuminate\Database\Eloquent\Builder;

class HistoryRBTQuery extends BaseRBTQuery
{
    const ORDER_COL = 'RBT_plays.created_at';

    public function get(int $userId): Builder
    {
        return $this->baseQuery()
            // select latest row from RBT_plays using windowing function
            ->join(
                'RBT_plays',
                'RBT.id',
                '=',
                'RBT_plays.RBT_id',
            )
            ->groupBy('RBT.id')
            ->where('RBT_plays.user_id', $userId)
            ->select('RBT.*', 'RBT_plays.created_at as added_at');
    }
}
