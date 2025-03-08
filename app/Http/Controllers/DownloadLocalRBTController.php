<?php

namespace App\Http\Controllers;

use App\Models\RBT;
use Common\Core\BaseController;
use Common\Files\FileEntry;
use Common\Files\Response\FileResponseFactory;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

class DownloadLocalRBTController extends BaseController
{
    public function __construct(
        protected RBT $RBT,
        protected FileEntry $fileEntry,
    ) {
    }

    public function download($id)
    {
        $RBT = $this->RBT->findOrFail($id)->makeVisible('src');

        $this->authorize('download', $RBT);

        if (!$RBT->src) {
            abort(404);
        }

        // RBT is local
        if ($RBT->srcIsLocal()) {
            $entry = $this->fileEntry
                ->where('file_name', $RBT->getSourceFileEntryId())
                ->firstOrFail();

            $ext = pathinfo($RBT->src, PATHINFO_EXTENSION);
            $RBTName =
                str_replace('%', '', Str::ascii($RBT->name)) . ".$ext";
            $entry->name = $RBTName;

            return app(FileResponseFactory::class)->create(
                $entry,
                'attachment',
            );

            // RBT is remote
        } else {
            $response = response()->stream(function () use ($RBT) {
                echo file_get_contents($RBT->src);
            });

            $path = parse_url($RBT->src, PHP_URL_PATH);
            $extension = pathinfo($path, PATHINFO_EXTENSION) ?: 'mp3';

            $disposition = $response->headers->makeDisposition(
                ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                "$RBT->name.$extension",
                str_replace('%', '', Str::ascii("$RBT->name.$extension")),
            );

            $response->headers->replace([
                'Content-Type' => 'audio/mpeg',
                'Content-Disposition' => $disposition,
            ]);

            return $response;
        }
    }
}
