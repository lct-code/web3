<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateArtistRBTTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('artist_RBT', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('artist_id')->unsigned()->index();
            $table->integer('RBT_id')->unsigned()->index();
            $table->boolean('primary')->default(false)->index();

            $table->unique(['artist_id', 'RBT_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('artist_RBT');
    }
}
