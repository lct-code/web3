<?php

use App\Models\r_b_t;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RenamerbtUserTableToLikedrbt extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('r_b_t_user', function (Blueprint $table) {
            $table->rename('likes');
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->renameColumn('r_b_t_id', 'likeable_id');
        });

        Schema::table('likes', function (Blueprint $table) {


            $table->string('likeable_type', 20)->default(addslashes(r_b_t::class))->after('likeable_id');

            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('likes');
            if (array_key_exists('r_b_t_user_r_b_t_id_user_id_unique', $indexesFound)) {
                $table->dropIndex('r_b_t_user_r_b_t_id_user_id_unique');
            }

            $table->unique(['likeable_id', 'likeable_type', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->rename('r_b_t_user');
        });
    }
}
