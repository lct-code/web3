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
        Schema::create('reward_link_transactions', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('reward_link_id');

            // This would create INT(11) column, colliding with users.id:
            // $table->unsignedBigInteger('user_id');
            // We'll use the following instead:
            $table->integer('user_id', 10)->unsigned();  

            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->foreign('reward_link_id')->references('id')->on('reward_links')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_link_transactions');
    }
};
