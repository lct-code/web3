<?php

use App\Models\r_b_t;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up()
    {
        $r_b_t = r_b_t::whereNotNull('youtube_id')
            ->whereNull('src')
            ->cursor();

        foreach ($r_b_t as $r_b_t) {
            $r_b_t->src = $r_b_t->youtube_id;
            $r_b_t->youtube_id = null;
            $r_b_t->save();
        }
    }

    public function down()
    {
        //
    }
};
