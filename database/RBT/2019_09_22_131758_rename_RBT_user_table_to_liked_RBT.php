<?php

use App\Models\RBT;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RenameRBTUserTableToLikedRBT extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('RBT_user', function (Blueprint $table) {
            $table->rename('likes');
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->renameColumn('RBT_id', 'likeable_id');
        });

        Schema::table('likes', function (Blueprint $table) {


            $table->string('likeable_type', 20)->default(addslashes(RBT::class))->after('likeable_id');

            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('likes');
            if (array_key_exists('RBT_user_RBT_id_user_id_unique', $indexesFound)) {
                $table->dropIndex('RBT_user_RBT_id_user_id_unique');
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
            $table->rename('RBT_user');
        });
    }
}
