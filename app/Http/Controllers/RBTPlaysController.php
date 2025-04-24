<?php namespace App\Http\Controllers;

use App\Models\RBT;
use App\Services\RBT\LogRBTPlay;
use App\Services\RBT\Queries\HistoryRBTQuery;
use Common\Core\BaseController;
use Common\Database\Datasource\Datasource;
use Illuminate\Support\Carbon;

class RBTPlaysController extends BaseController
{
    public function index($userId)
    {
        $orderBy = request()->get('orderBy');
        $orderDir = request()->get('orderDir');

        // prevent ambiguous column db error
        if ($orderBy === 'created_at') {
            $orderBy = 'RBT_plays.created_at';
        }

        $query = (new HistoryRBTQuery([
            'orderBy' => $orderBy,
            'orderDir' => $orderDir,
        ]))->get($userId);

        $params = request()->all();
        $params['perPage'] = request()->get('perPage', 30);
        $datasource = new Datasource($query, $params);
        $datasource->order = false;

        $pagination = $datasource->paginate();
        $pagination->transform(function (RBT $RBT) {
            $RBT->added_at = $RBT->added_at
                ? new Carbon($RBT->added_at)
                : null;
            return $RBT;
        });

        return $this->success(['pagination' => $pagination]);
    }

    public function create(RBT $RBT)
    {
        $this->authorize('show', $RBT);

        app(LogRBTPlay::class)->execute($RBT, request()->get('queueId'));

        return $this->success();
    }
}
