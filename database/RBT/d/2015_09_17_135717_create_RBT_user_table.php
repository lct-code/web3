<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRBTUserTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('r_b_t_user', function(Blueprint $table) {
			$table->increments('id');
			$table->integer('r_b_t_id')->index()->unsigned();
			$table->integer('user_id')->index()->unsigned();
			$table->timestamps();

			$table->unique(['r_b_t_id', 'user_id']);

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
		Schema::drop('r_b_t_user');
	}

}
