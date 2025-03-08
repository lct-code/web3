<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUserIdColumnsTorbtTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('r_b_t', function (Blueprint $table) {
            if ( ! Schema::hasColumn('r_b_t', 'description')) {
                $table->text('description')->nullable();
            }
            if ( ! Schema::hasColumn('r_b_t', 'image')) {
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
        Schema::table('r_b_t', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
    }
}
