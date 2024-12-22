<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prices', function (Blueprint $table) {
            $table->renameColumn('zain_product_id', 'zain_sd_product_id'); // Replace 'correct_column_name' with the desired name
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prices', function (Blueprint $table) {
            $table->renameColumn('zain_sd_product_id', 'zain_product_id'); // Revert back to the original name
        });
    }
};
