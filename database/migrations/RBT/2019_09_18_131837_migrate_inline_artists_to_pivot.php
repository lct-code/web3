<?php

use App\Models\Artist;
use App\Models\r_b_t;
use App\Services\Providers\SaveOrUpdate;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Migrations\Migration;

class MigrateInlineArtistsToPivot extends Migration
{
    use SaveOrUpdate;

    /**
     * @return void
     */
    public function up()
    {
        if ( ! Schema::hasColumn('r_b_t', 'artists_legacy')) return;

        app(r_b_t::class)
            ->whereNotNull('artists_legacy')
            ->chunkById(100, function(Collection $r_b_t) {
                $artistNames = $r_b_t->pluck('artists_legacy')->map(function($artists) {
                    return explode('*|*', $artists);
                })->flatten()->unique();

                $artists = app(Artist::class)
                    ->whereIn('name', $artistNames)
                    ->select(['id', 'name'])
                    ->get();

                $pivots = $r_b_t->map(function(r_b_t $r_b_t) use($artists) {
                    $artistNames = explode('*|*', $r_b_t->artists_legacy);
                    $pivots = array_map(function($artistName) use($artists, $r_b_t) {
                        $artist = $artists->first(function(Artist $artist) use($artistName) {
                            return strtolower($artist->name) === strtolower($artistName);
                        });
                        if ($artist) {
                            return [
                                'r_b_t_id' => $r_b_t->id,
                                'artist_id' => $artist->id
                            ];
                        }
                    }, $artistNames);

                    return $pivots;
                })->flatten(1)->filter();

                if ($pivots->isEmpty()) {
                    return;
                }

                try {
                    $this->saveOrUpdate($pivots->toArray(), 'artist_r_b_t');
                    DB::table('r_b_t')->whereIn('id', $r_b_t->pluck('id'))->update(['artists_legacy' => null]);
                } catch (Exception $e) {
                    //
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
        //
    }
}
