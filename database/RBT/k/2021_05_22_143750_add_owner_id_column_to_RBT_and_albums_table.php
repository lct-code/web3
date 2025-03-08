<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddOwnerIdColumnToRBTAndAlbumsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if ( ! Schema::hasColumn('r_b_t_s', 'owner_id')) {
            Schema::table('r_b_t_s', function (Blueprint $table) {
                $table->bigInteger('owner_id')->unsigned()->nullable()->index();
            });
        }

        if ( ! Schema::hasColumn('albums', 'owner_id')) {
            Schema::table('albums', function (Blueprint $table) {
                $table->bigInteger('owner_id')->unsigned()->nullable()->index();
            });
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
