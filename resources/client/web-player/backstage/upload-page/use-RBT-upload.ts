import {RBTUploadStatus} from '@app/admin/RBT-datatable-page/RBT-form/RBT-upload-progress';
import {useFileUploadStore} from '@common/uploads/uploader/file-upload-provider';
import {RBTUploadMeta} from '@app/web-player/backstage/upload-page/use-RBT-uploader';

export function useRBTUpload(uploadId: string | undefined) {
  const upload = useFileUploadStore(s =>
    uploadId ? s.fileUploads.get(uploadId) : null
  );

  let isUploading = false;
  let status: RBTUploadStatus;

  if (upload) {
    const meta = upload.meta as RBTUploadMeta | undefined;
    const isProcessing = meta?.isExtractingMetadata || meta?.isGeneratingWave;

    isUploading =
      upload?.status === 'pending' ||
      upload?.status === 'inProgress' ||
      !!isProcessing;

    status =
      upload?.status === 'completed' && isProcessing
        ? 'processing'
        : upload?.status;
  }

  return {isUploading, status, activeUpload: upload};
}
