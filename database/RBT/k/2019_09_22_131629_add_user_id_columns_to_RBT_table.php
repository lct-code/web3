<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUserIdColumnsToRBTTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('r_b_t_s', function (Blueprint $table) {
            if ( ! Schema::hasColumn('r_b_t_s', 'description')) {
                $table->text('description')->nullable();
            }
            if ( ! Schema::hasColumn('r_b_t_s', 'image')) {
                $table->string('image')->nullable();
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
            $table->dropColumn('user_id');
        });
    }
}
