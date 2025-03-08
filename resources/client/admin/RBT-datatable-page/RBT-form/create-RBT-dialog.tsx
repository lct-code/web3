import {Dialog} from '@common/ui/overlays/dialog/dialog';
import {DialogHeader} from '@common/ui/overlays/dialog/dialog-header';
import {Trans} from '@common/i18n/trans';
import React from 'react';
import {DialogBody} from '@common/ui/overlays/dialog/dialog-body';
import {RBTForm} from '@app/admin/RBT-datatable-page/RBT-form/RBT-form';
import {Form} from '@common/ui/forms/form';
import {Button} from '@common/ui/buttons/button';
import {DialogFooter} from '@common/ui/overlays/dialog/dialog-footer';
import {useDialogContext} from '@common/ui/overlays/dialog/dialog-context';
import {useCreateRBTForm} from '@app/admin/RBT-datatable-page/crupdate/use-create-RBT-form';
import {CreateRBTPayload} from '@app/admin/RBT-datatable-page/requests/use-create-RBT';

interface Props {
  defaultValues?: Partial<CreateRBTPayload>;
  hideAlbumField?: boolean;
}
export function CreateRBTDialog({defaultValues, hideAlbumField}: Props) {
  const {formId, close} = useDialogContext();
  const {form} = useCreateRBTForm({defaultValues});
  return (
    <Dialog size="fullscreen">
      <DialogHeader>
        <Trans message="Add new RBT" />
      </DialogHeader>
      <DialogBody>
        <Form
          id={formId}
          form={form}
          onSubmit={values => {
            close(values);
          }}
          onBeforeSubmit={() => {
            form.clearErrors();
          }}
        >
          <RBTForm showExternalIdFields showAlbumField={!hideAlbumField} />
        </Form>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" onClick={() => close()}>
          <Trans message="Cancel" />
        </Button>
        <Button form={formId} variant="flat" color="primary" type="submit">
          <Trans message="Create" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
