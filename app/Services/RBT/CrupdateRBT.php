<?php

namespace App\Services\RBT;

use App\Models\Album;
use App\Models\Genre;
use App\Models\RBT;
use App\Notifications\ArtistUploadedMedia;
use App\Services\Providers\SaveOrUpdate;
use Arr;
use Auth;
use Common\Tags\Tag;
use DB;
use Exception;
use Illuminate\Support\Collection;
use Notification;

class CrupdateRBT
{
    use SaveOrUpdate;

    public function __construct(
        protected RBT $RBT,
        protected Tag $tag,
        protected Genre $genre,
    ) {
    }

    public function execute(
        array $data,
        RBT $initialRBT = null,
        Album|array $album = null,
        bool $loadRelations = true,
    ): RBT {
        $RBT = $initialRBT ?: $this->RBT->newInstance();

        $inlineData = Arr::except($data, [
            'artists',
            'tags',
            'genres',
            'album',
            'waveData',
            'lyrics',
        ]);
        $inlineData['spotify_id'] =
            $inlineData['spotify_id'] ?? Arr::get($initialRBT, 'spotify_id');

        if (!$initialRBT) {
            $inlineData['owner_id'] = Auth::id();
        }

        if ($album) {
            $inlineData['album_id'] = $album['id'];
        }

        $RBT->fill($inlineData)->save();

        $newArtists = collect($this->getArtistIds($data, $album) ?: []);
        $newArtists = $newArtists->map(function ($artistId) {
            if ($artistId === 'CURRENT_USER') {
                return Auth::user()->getOrCreateArtist()->id;
            } else {
                return $artistId;
            }
        });

        // make sure we're only attaching new artists to avoid too many db queries
        if ($RBT->relationLoaded('artists')) {
            $newArtists = $newArtists->filter(function ($newArtistId) use (
                $RBT,
            ) {
                return !$RBT
                    ->artists()
                    ->where('artists.id', $newArtistId)
                    ->first();
            });
        }

        if ($newArtists->isNotEmpty()) {
            $pivots = $newArtists->map(function ($artistId, $index) use ($RBT) {
                \Log::info('Creating artist pivot', [
                    'artist_id' => $artistId,
                    'RBT_id' => $RBT['id'],
                    'primary' => $index === 0,
                ]);
                return [
                    'artist_id' => $artistId,
                    'RBT_id' => $RBT['id'],
                    'primary' => $index === 0,
                ];
            });

            DB::table('artist_r_b_t')
                ->where('RBT_id', $RBT->id)
                ->delete();
            DB::table('artist_r_b_t')->insert($pivots->toArray());
        }

        $tags = Arr::get($data, 'tags', []);
        $tagIds = $this->tag->insertOrRetrieve($tags)->pluck('id');
        $RBT->tags()->sync($tagIds);

        $genres = Arr::get($data, 'genres', []);
        $genreIds = $this->genre->insertOrRetrieve($genres)->pluck('id');
        $RBT->genres()->sync($genreIds);

        if ($loadRelations) {
            $RBT->load('artists', 'tags', 'genres');
        }

        if (!$initialRBT && !$album) {
            $firstArtist = $RBT->artists->first();
            if ($firstArtist) {
                $firstArtist->followers()
                    ->chunkById(1000, function ($followers) use ($RBT) {
                        try {
                            Notification::send(
                                $followers,
                                new ArtistUploadedMedia($RBT),
                            );
                        } catch (Exception $e) {
                            //
                        }
                    });
            }
        }

        if ($waveData = Arr::get($data, 'waveData')) {
            $this->RBT
                ->getWaveStorageDisk()
                ->put("waves/{$RBT->id}.json", json_encode($waveData));
        }

        if ($lyrics = Arr::get($data, 'lyrics')) {
            $RBT->lyric()->create(['text' => $lyrics]);
        }

        return $RBT;
    }

    private function getArtistIds(array|Collection $RBTData, array|Album $album = null): array|Collection|null
    {
        if ($RBTArtists = Arr::get($RBTData, 'artists')) {
            return $RBTArtists;
        } elseif (isset($album['artists'])) {
            return $album['artists'];
        }

        return null;
    }
}
