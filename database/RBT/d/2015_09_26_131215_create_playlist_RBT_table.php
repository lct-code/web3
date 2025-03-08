<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePlaylistRBTTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('playlist_r_b_t', function(Blueprint $table) {
			$table->increments('id');
			$table->integer('playlist_id')->unsigned();
			$table->integer('r_b_t_id')->unsigned();

			$table->unique(['r_b_t_id', 'playlist_id']);

            $table->collation = config('database.connections.mysql.collation');
            $table->charset = config('database.connections.mysql.charset');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('playlist_r_b_t');
	}

}
