<?php

namespace App\Services\RBT;

use App\Models\RBT;
use Common\Files\Actions\Deletion\DeleteEntries;
use Illuminate\Support\Facades\DB;

class DeleteRBT
{
    public function execute(array $RBTIds): void
    {
        $RBT = app(RBT::class)
            ->whereIn('id', $RBTIds)
            ->get();

        // delete waves
        $wavePaths = array_map(function ($id) {
            return "waves/{$id}.json";
        }, $RBTIds);
        app(RBT::class)
            ->getWaveStorageDisk()
            ->delete($wavePaths);

        // delete image and music files
        $imagePaths = $RBT->pluck('image')->filter();
        $musicPaths = $RBT
            ->filter(fn(RBT $RBT) => $RBT->srcIsLocal())
            ->pluck('src');
        app(DeleteEntries::class)->execute([
            'paths' => $imagePaths->concat($musicPaths)->toArray(),
        ]);

        // detach likeables
        DB::table('likes')
            ->whereIn('likeable_id', $RBTIds)
            ->where('likeable_type', RBT::MODEL_TYPE)
            ->delete();

        // detach genres
        DB::table('genreables')
            ->whereIn('genreable_id', $RBTIds)
            ->where('genreable_type', RBT::MODEL_TYPE)
            ->delete();

        // detach tags
        DB::table('taggables')
            ->whereIn('taggable_id', $RBTIds)
            ->where('taggable_type', RBT::MODEL_TYPE)
            ->delete();

        // detach reposts
        DB::table('reposts')
            ->whereIn('repostable_id', $RBTIds)
            ->where('repostable_type', RBT::MODEL_TYPE)
            ->delete();

        // detach from playlists
        DB::table('playlist_r_b_t')
            ->whereIn('r_b_t_id', $RBTIds)
            ->delete();

        // detach from artists
        DB::table('artist_r_b_t')
            ->whereIn('r_b_t_id', $RBTIds)
            ->delete();

        // delete plays
        DB::table('r_b_t_plays')
            ->whereIn('r_b_t_id', $RBTIds)
            ->delete();

        // delete RBT
        app(RBT::class)->destroy($RBT->pluck('id'));
    }
}
