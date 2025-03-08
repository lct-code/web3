<?php namespace App\Http\Controllers;

use App\Http\Requests\ModifyRBT;
use App\Models\RBT;
use App\Services\RBT\CrupdateRBT;
use App\Services\RBT\DeleteRBT;
use App\Services\RBT\LoadRBT;
use App\Services\RBT\PaginateRBT;
use Common\Core\BaseController;
use Illuminate\Http\Request;

class RBTController extends BaseController
{
    public function __construct(
        protected RBT $RBT,
        protected Request $request,
    ) {
    }

    public function index()
    {
        $this->authorize('index', RBT::class);

        $pagination = App(PaginateRBT::class)->execute(
            $this->request->all(),
        );

        $pagination->makeVisible(['views', 'updated_at', 'plays']);

        return $this->success(['pagination' => $pagination]);
    }

    public function show(RBT $RBT)
    {
        $this->authorize('show', $RBT);

        $loader = request('loader', 'RBTPage');
        $data = (new LoadRBT())->execute($RBT, $loader);

        return $this->renderClientOrApi([
            'pageName' => $loader === 'RBTPage' ? 'RBT-page' : null,
            'data' => $data,
        ]);
    }

    public function store(ModifyRBT $request)
    {
        $this->authorize('store', RBT::class);

        $RBT = app(CrupdateRBT::class)->execute(
            $request->all(),
            null,
            $request->get('album'),
        );

        return $this->success(['RBT' => $RBT]);
    }

    public function update(int $id, ModifyRBT $request)
    {
        $RBT = $this->RBT->findOrFail($id);

        $this->authorize('update', $RBT);

        $RBT = app(CrupdateRBT::class)->execute(
            $request->all(),
            $RBT,
            $request->get('album'),
        );

        return $this->success(['RBT' => $RBT]);
    }

    public function destroy(string $ids)
    {
        $RBTIds = explode(',', $ids);
        $this->authorize('destroy', [RBT::class, $RBTIds]);

        app(DeleteRBT::class)->execute($RBTIds);

        return $this->success();
    }
}
