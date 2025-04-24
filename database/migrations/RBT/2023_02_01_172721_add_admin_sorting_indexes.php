<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('r_b_t', function (Blueprint $table) {

            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexesFound = $sm->listTableIndexes('r_b_t');
            if (!array_key_exists('updated_at_index', $indexesFound)) {
                $table->index('updated_at');
            }
            if (!array_key_exists('name_index', $indexesFound)) {
                $table->index('name');
            }
        });
        Schema::table('artists', function (Blueprint $table) {
            $table->index('updated_at');
        });
        Schema::table('albums', function (Blueprint $table) {
            $table->index('updated_at');
        });
        Schema::table('r_b_t_plays', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    public function down()
    {
        //
    }
};
