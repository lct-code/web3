import React, {ReactElement, useMemo} from 'react';
import {prettyBytes} from '@common/uploads/utils/pretty-bytes';
import {Trans} from '@common/i18n/trans';
import {FileUpload} from '@common/uploads/uploader/file-upload-store';
import {RBTUploadStatus} from '@app/admin/RBT-datatable-page/RBT-form/RBT-upload-progress';
import clsx from 'clsx';

interface Props {
  fileUpload: FileUpload;
  status: RBTUploadStatus;
  className?: string;
}
export function RBTUploadStatusText({fileUpload, status, className}: Props) {
  const bytesUploaded = fileUpload?.bytesUploaded || 0;
  const totalBytes = useMemo(
    () => prettyBytes(fileUpload.file.size),
    [fileUpload.file.size]
  );
  const uploadedBytes = useMemo(
    () => prettyBytes(bytesUploaded),
    [bytesUploaded]
  );

  let statusMessage: ReactElement;
  if (status === 'completed') {
    statusMessage = <Trans message="Upload complete" />;
  } else if (status === 'aborted') {
    statusMessage = <Trans message="Upload cancelled" />;
  } else if (status === 'failed') {
    statusMessage = <Trans message="Upload failed" />;
  } else if (status === 'processing') {
    statusMessage = <Trans message="Processing upload..." />;
  } else if (status === 'pending') {
    statusMessage = <Trans message="Waiting to start..." />;
  } else {
    statusMessage = (
      <Trans
        message=":bytesUploaded of :totalBytes uploaded"
        values={{
          bytesUploaded: uploadedBytes,
          totalBytes,
        }}
      />
    );
  }

  return (
    <div className={clsx('text-muted text-xs', className)}>{statusMessage}</div>
  );
}
