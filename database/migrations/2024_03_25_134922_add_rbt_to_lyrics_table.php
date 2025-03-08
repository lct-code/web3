<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('lyrics', function (Blueprint $table) {
            $table->integer('r_b_t_id')->unique()->index();
        });
    }

    public function down(): void
    {
        Schema::table('lyrics', function (Blueprint $table) {
            $table->integer('r_b_t_id')->unique()->index();
        });
    }
};
