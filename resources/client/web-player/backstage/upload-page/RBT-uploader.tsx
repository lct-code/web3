import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {useFileUploadStore} from '@common/uploads/uploader/file-upload-provider';
import {
  RBTUploadPayload,
  useRBTUploader,
} from '@app/web-player/backstage/upload-page/use-RBT-uploader';
import {mergeRBTFormValues} from '@app/admin/RBT-datatable-page/requests/use-extract-RBT-file-metadata';
import {
  UploaderActions,
  UploaderProps,
} from '@app/web-player/backstage/upload-page/upload-page';
import {RBT} from '@app/web-player/RBT/RBT';
import {useForm} from 'react-hook-form';
import {useCreateRBT} from '@app/admin/RBT-datatable-page/requests/use-create-RBT';
import {useRBTUpload} from '@app/web-player/backstage/upload-page/use-RBT-upload';
import {RBTUploadProgress} from '@app/admin/RBT-datatable-page/RBT-form/RBT-upload-progress';
import {Form} from '@common/ui/forms/form';
import {RBTForm} from '@app/admin/RBT-datatable-page/RBT-form/RBT-form';
import {Button} from '@common/ui/buttons/button';
import {Trans} from '@common/i18n/trans';
import {usePrimaryArtistForCurrentUser} from '@app/web-player/backstage/use-primary-artist-for-current-user';

export const RBTUploader = forwardRef<UploaderActions, UploaderProps>(
  ({onUploadStart, onCancel, onCreate}, ref) => {
    const userArtist = usePrimaryArtistForCurrentUser();
    const abortUpload = useFileUploadStore(s => s.abortUpload);
    const [RBT, setRBT] = useState<RBTUploadPayload[]>([]);

    const {openFilePicker, uploadRBT, validateUploads} = useRBTUploader({
      onUploadStart: data => {
        setRBT(prev => {
          if (userArtist) {
            return [...prev, {...data, artists: [userArtist]}];
          }
          return [...prev, data];
        });
        onUploadStart();
      },
      onMetadataChange: (file, newData) => {
        setRBT(allRBT => {
          return allRBT.map(RBT => {
            return RBT.uploadId === file.id
              ? mergeRBTFormValues(newData, RBT)
              : RBT;
          });
        });
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        openFilePicker,
        uploadRBT,
        validateUploads,
      }),
      [openFilePicker, uploadRBT, validateUploads],
    );

    return (
      <div className="w-full">
        {RBT.map(RBT => (
          <RBTUploadItem
            key={RBT.uploadId}
            RBT={RBT}
            onCreate={createdRBT => {
              // hide upload form for this RBT
              setRBT(prev =>
                prev.filter(t => t.uploadId !== RBT.uploadId),
              );
              onCreate(createdRBT);
            }}
            onRemove={() => {
              setRBT(prev => {
                const newRBT = prev.filter(
                  t => t.uploadId !== RBT.uploadId,
                );
                // only invoke "onCancel" if every uploaded RBT has been removed, so upload mode can be unlocked
                if (!newRBT.length) {
                  onCancel();
                }
                return newRBT;
              });
              abortUpload(RBT.uploadId);
            }}
          />
        ))}
      </div>
    );
  },
);

interface RBTUploadItemProps {
  RBT: RBTUploadPayload;
  onRemove: () => void;
  onCreate: (RBT: RBT) => void;
}
const RBTUploadItem = memo(
  ({RBT, onRemove, onCreate}: RBTUploadItemProps) => {
    const form = useForm<RBTUploadPayload>({
      defaultValues: RBT,
    });
    const createRBT = useCreateRBT(form);
    const activeUpload = useFileUploadStore(s =>
      s.fileUploads.get(RBT.uploadId),
    );
    const {isUploading, status} = useRBTUpload(RBT.uploadId);

    useEffect(() => {
      form.reset(RBT);
    }, [RBT, form]);

    const uploadProgress =
      isUploading && activeUpload ? (
        <RBTUploadProgress fileUpload={activeUpload} status={status} />
      ) : null;

    return (
      <Form
        form={form}
        onSubmit={values => {
          createRBT.mutate(values, {
            onSuccess: response => onCreate(response.RBT),
          });
        }}
        className="rounded border p-14 md:p-24 mb-30 bg-paper"
      >
        <RBTForm uploadButton={uploadProgress} showExternalIdFields={false} />
        <Button variant="text" onClick={() => onRemove()} className="mr-10">
          <Trans message="Cancel" />
        </Button>
        <Button
          type="submit"
          variant="flat"
          color="primary"
          disabled={createRBT.isPending || !form.watch('src')}
        >
          <Trans message="Save" />
        </Button>
      </Form>
    );
  },
);
