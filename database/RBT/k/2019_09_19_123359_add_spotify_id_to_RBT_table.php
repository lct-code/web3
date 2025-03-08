<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSpotifyIdToRBTTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('r_b_t_s', function (Blueprint $table) {
            if ( ! Schema::hasColumn('r_b_t_s', 'spotify_id')) {
                $table->char('spotify_id', 22)->unique()->nullable()->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('r_b_t_s', function (Blueprint $table) {
            $table->dropColumn('spotify_id');
        });
    }
}
