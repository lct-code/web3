<?php

namespace App\Http\Controllers;

use App\Services\RBT\ExtractMetadataFromRBTFile;
use Common\Core\BaseController;
use Common\Files\FileEntry;

class RBTFileMetadataController extends BaseController
{
    public function extract(FileEntry $fileEntry)
    {
        $this->authorize('show', $fileEntry);

        return $this->success([
            'metadata' => app(ExtractMetadataFromRBTFile::class)->execute(
                $fileEntry,
                request()->all(),
            ),
        ]);
    }
}
