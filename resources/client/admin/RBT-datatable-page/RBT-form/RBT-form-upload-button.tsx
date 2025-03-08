import React, {useState} from 'react';
import {Trans} from '@common/i18n/trans';
import {Button} from '@common/ui/buttons/button';
import {FileUploadIcon} from '@common/icons/material/FileUpload';
import {RBTUploadProgress} from '@app/admin/RBT-datatable-page/RBT-form/RBT-upload-progress';
import {useFormContext} from 'react-hook-form';
import {CreateRBTPayload} from '@app/admin/RBT-datatable-page/requests/use-create-RBT';
import {useRBTUploader} from '@app/web-player/backstage/upload-page/use-RBT-uploader';
import {useRBTUpload} from '@app/web-player/backstage/upload-page/use-RBT-upload';
import {useFileUploadStore} from '@common/uploads/uploader/file-upload-provider';
import {mergeRBTFormValues} from '@app/admin/RBT-datatable-page/requests/use-extract-RBT-file-metadata';

export function RBTFormUploadButton() {
  const [uploadId, setUploadId] = useState<string>();
  const {setValue, watch, getValues} = useFormContext<CreateRBTPayload>();
  const {openFilePicker} = useRBTUploader({
    onUploadStart: ({uploadId}) => setUploadId(uploadId),
    onMetadataChange: (file, newData) => {
      const mergedValues = mergeRBTFormValues(newData, getValues());
      Object.entries(mergedValues).forEach(([key, value]) =>
        setValue(key as keyof CreateRBTPayload, value, {shouldDirty: true})
      );
    },
  });
  const {status, isUploading, activeUpload} = useRBTUpload(uploadId);
  const {abortUpload, clearInactive} = useFileUploadStore();
  return (
    <div>
      <Button
        className="w-full"
        variant="flat"
        color="primary"
        startIcon={<FileUploadIcon />}
        disabled={isUploading}
        onClick={() => openFilePicker()}
      >
        {watch('src') ? (
          <Trans message="Replace file" />
        ) : (
          <Trans message="Upload file" />
        )}
      </Button>
      {activeUpload && (
        <RBTUploadProgress
          fileUpload={activeUpload}
          status={status}
          className="mt-24"
          onAbort={uploadId => {
            abortUpload(uploadId);
            clearInactive();
          }}
        />
      )}
    </div>
  );
}
