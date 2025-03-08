<?php

use App\Models\Playlist;
use Illuminate\Database\Migrations\Migration;

class HydrateAddedByColumnInPlaylistrbtTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        foreach (Playlist::cursor() as $playlist) {
            DB::table('playlist_r_b_t')->where('playlist_id', $playlist->id)->update(['added_by' => $playlist->owner_id]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
       //
    }
}
