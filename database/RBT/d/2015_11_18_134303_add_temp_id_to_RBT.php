<?php

use Illuminate\Database\Migrations\Migration;

class AddTempIdToRBT extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('r_b_t', function($table)
		{
    		$table->string('temp_id', 8)->index()->nullable();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('r_b_t', function($table)
		{
		    $table->dropColumn('temp_id');
		});
	}

}