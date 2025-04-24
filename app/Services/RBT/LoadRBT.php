<?php

namespace App\Services\RBT;

use App\Models\Artist;
use App\Models\Genre;
use App\Models\RBT;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoadRBT
{
    public function execute(RBT $RBT, string $loader): array
    {
        $data = ['RBT' => $RBT, 'loader' => $loader];

        if ($loader === 'RBTPage' || 'loader' === 'editRBTPage') {
            $data['RBT']->load(['tags', 'genres', 'artists']);
            $data['RBT']->loadCount(['reposts', 'likes']);
            $data = $this->loadFullAlbum($data);
            $data['RBT']->makeVisible('description');
        }

        if ($loader === 'editRBTPage') {
            $data['RBT']->setHidden([]);
            $data['RBT']->setRelation(
                'artists',
                $data['RBT']->artists->map(
                    fn(Artist $artist) => $artist->toNormalizedArray(),
                ),
            );
            $data['RBT']->setRelation(
                'genres',
                $data['RBT']->genres->map(
                    fn(Genre $genre) => $genre->toNormalizedArray(),
                ),
            );
        }

        if ($data['RBT']->relationLoaded('album') && $data['RBT']->album) {
            $data['RBT']->album->addPopularityToRBT();
        }

        return $data;
    }

    protected function loadFullAlbum(array $data): array
    {
        $data['RBT']->load([
            'album' => fn(BelongsTo $builder) => $builder->with([
                'artists',
                'RBT.artists',
            ]),
        ]);
        return $data;
    }
}
