<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreaterbtTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('r_b_t', function(Blueprint $table) {
			$table->increments('id');
			$table->string('name');
            $table->integer('album_id')->unsigned()->index()->nullable();
			$table->tinyInteger('number')->unsigned()->index();
			$table->integer('duration')->unsigned()->nullable();
			$table->string('youtube_id')->index()->nullable();
			$table->tinyInteger('spotify_popularity')->unsigned()->nullable()->index();
            $table->bigInteger('owner_id')->unsigned()->nullable()->index();
            $table->string('temp_id', 8)->index()->nullable();
			$table->string('src')->nullable();
			$table->bigInteger('plays')->unsigned()->default(0)->index();
			$table->timestamp('created_at')->nullable();
			$table->timestamp('updated_at')->nullable();
			$table->text('description')->nullable();
			$table->string('image')->nullable();

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
		Schema::drop('r_b_t');
	}

}
