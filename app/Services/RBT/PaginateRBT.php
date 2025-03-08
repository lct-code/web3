<?php

namespace App\Services\RBT;

use App\Models\RBT;
use Common\Database\Datasource\Datasource;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Str;

class PaginateRBT
{
    public function execute(array $params, $builder = null): AbstractPaginator
    {
        if (!$builder) {
            $builder = RBT::query();
        }

        $builder
            ->with('album.artists')
            ->with(['artists', 'genres'])
            ->withCount('plays');

        $datasource = new Datasource($builder, $params);
        $order = $datasource->getOrder();

        if (Str::endsWith($order['col'], 'popularity')) {
            $datasource->order = false;
            $builder->orderByPopularity($order['dir']);
        }

        return $datasource->paginate();
    }
}
