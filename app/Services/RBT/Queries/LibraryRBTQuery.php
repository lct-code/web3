<?php

namespace App\Services\RBT\Queries;

use App\Models\RBT;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class LibraryRBTQuery extends BaseRBTQuery
{
    const ORDER_COL = 'added_at';

    public function get(int $userId): Builder
    {
        return $this->baseQuery()
            ->join('likes', 'RBT.id', '=', 'likes.likeable_id')
            ->where('likes.user_id', $userId)
            ->where('likes.likeable_type', RBT::MODEL_TYPE)
            ->select('RBT.*', 'likes.created_at as added_at');
    }

    public function getOrder(): array
    {
        $orderBy = Arr::get($this->params, 'orderBy');
        $orderDir = Arr::get($this->params, 'orderDir');

        // library RBT page loading will error without this, column is called 'added_at' on the RBT model
        if ($orderBy === 'likes.created_at') {
            $orderBy = 'added_at';
        }

        return [
            'col' => $orderBy ?: static::ORDER_COL,
            'dir' => $orderDir ?: static::ORDER_DIR,
        ];
    }
}
