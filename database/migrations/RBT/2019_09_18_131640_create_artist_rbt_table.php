<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateArtistrbtTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('artist_r_b_t', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('artist_id')->unsigned()->index();
            $table->integer('r_b_t_id')->unsigned()->index();
            $table->integer('RBT_id')->index()->unsigned();
            $table->boolean('primary')->default(false)->index();

            $table->unique(['artist_id', 'r_b_t_id' ,'RBT_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('artist_r_b_t');
    }
}
