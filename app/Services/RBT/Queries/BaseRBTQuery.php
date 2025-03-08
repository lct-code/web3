<?php

namespace App\Services\RBT\Queries;

use App\Models\RBT;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Arr;

abstract class BaseRBTQuery
{
    const ORDER_DIR = 'desc';

    public function __construct(protected array $params)
    {
    }

    abstract public function get(int $modelId): Builder;

    protected function baseQuery(): Builder
    {
        $order = $this->getOrder();

        return app(RBT::class)
            ->with([
                'artists',
                'album' => function (BelongsTo $q) {
                    return $q->select('id', 'name', 'image');
                },
            ])
            ->orderBy($order['col'], $order['dir'])
            ->orderBy('RBT.id', 'desc');
    }

    public function getOrder(): array
    {
        return [
            'col' => Arr::get($this->params, 'orderBy') ?: static::ORDER_COL,
            'dir' => Arr::get($this->params, 'orderDir') ?: static::ORDER_DIR,
        ];
    }
}
