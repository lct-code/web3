<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use App\Models\User;
use App\Services\RBT\Queries\AlbumRBTQuery;
use App\Services\RBT\Queries\ArtistRBTQuery;
use App\Services\RBT\Queries\BaseRBTQuery;
use App\Services\RBT\Queries\HistoryRBTQuery;
use App\Services\RBT\Queries\LibraryRBTQuery;
use App\Services\RBT\Queries\PlaylistRBTQuery;
use Common\Core\BaseController;
use Illuminate\Database\Eloquent\Builder;

class PlayerRBTController extends BaseController
{
    private array $queryMap = [
        Playlist::MODEL_TYPE => PlaylistRBTQuery::class,
        Artist::MODEL_TYPE => ArtistRBTQuery::class,
        User::MODEL_TYPE => LibraryRBTQuery::class,
        Album::MODEL_TYPE => AlbumRBTQuery::class,
    ];

    public function index()
    {
        $queueId = request()->get('queueId');
        $perPage = (int) request()->get('perPage', 30);

        $this->validate(request(), [
            'queueId' => 'required|string',
            'perPage' => 'integer|min:1|max:100',
        ]);

        [$modelType, $modelId, $queueType, $queueOrder] = array_pad(
            explode('.', $queueId),
            4,
            null,
        );
        // dot will be replaced with ^ in to avoid parsing issues (e.g. RBT_plays^created instead of RBT_plays.created)
        $queueOrder = str_replace('^', '.', $queueOrder);

        $RBTQuery = $this->getRBTQuery($modelType, $queueOrder, $queueType);

        if (!$RBTQuery) {
            return $this->success(['RBT' => []]);
        }

        $dbQuery = $RBTQuery->get($modelId);
        $order = $RBTQuery->getOrder();

        if ($lastRBT = request()->get('lastRBT')) {
            $whereCol =
                $order['col'] === 'added_at'
                    ? 'likes.created_at'
                    : $order['col'];
            $this->applyCursor(
                $dbQuery,
                [$whereCol => $order['dir'], 'RBT.id' => 'desc'],
                [$lastRBT[$order['col']], $lastRBT['id']],
            );
        }

        return $this->success(['RBT' => $dbQuery->limit($perPage)->get()]);
    }

    private function getRBTQuery(
        string $modelType,
        ?string $order,
        string $queueType,
    ): ?BaseRBTQuery {
        $params = [];
        if ($order) {
            $parts = explode('|', $order);
            $params['orderBy'] = $parts[0];
            $params['orderDir'] = $parts[1];
        }

        if ($modelType === User::MODEL_TYPE) {
            return $queueType === 'playHistory'
                ? new HistoryRBTQuery($params)
                : new LibraryRBTQuery($params);
        }

        if (isset($this->queryMap[$modelType])) {
            return new $this->queryMap[$modelType]($params);
        }

        return null;
    }

    private function applyCursor(Builder $query, $columns, $cursor)
    {
        $query->where(function (Builder $query) use ($columns, $cursor) {
            $column = key($columns);
            $direction = array_shift($columns);
            $value = array_shift($cursor);

            $query->where(
                $column,
                $direction === 'asc' ? '>' : '<',
                is_null($value) ? 0 : $value,
            );

            if (!empty($columns)) {
                $query->orWhere($column, is_null($value) ? 0 : $value);
                $this->applyCursor($query, $columns, $cursor);
            }
        });
    }
}
