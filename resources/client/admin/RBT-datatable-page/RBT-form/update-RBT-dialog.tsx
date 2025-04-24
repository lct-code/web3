import {Dialog} from '@common/ui/overlays/dialog/dialog';
import {DialogHeader} from '@common/ui/overlays/dialog/dialog-header';
import {Trans} from '@common/i18n/trans';
import React from 'react';
import {useUpdateRBTForm} from '@app/admin/RBT-datatable-page/crupdate/use-update-RBT-form';
import {DialogBody} from '@common/ui/overlays/dialog/dialog-body';
import {RBTForm} from '@app/admin/RBT-datatable-page/RBT-form/RBT-form';
import {Form} from '@common/ui/forms/form';
import {Button} from '@common/ui/buttons/button';
import {DialogFooter} from '@common/ui/overlays/dialog/dialog-footer';
import {useDialogContext} from '@common/ui/overlays/dialog/dialog-context';
import {UpdateRBTPayload} from '@app/admin/RBT-datatable-page/requests/use-update-RBT';
import {CreateRBTPayload} from '@app/admin/RBT-datatable-page/requests/use-create-RBT';

interface Props {
  RBT: UpdateRBTPayload | CreateRBTPayload;
  hideAlbumField?: boolean;
}
export function UpdateRBTDialog({RBT, hideAlbumField}: Props) {
  const {formId, close} = useDialogContext();
  const {form} = useUpdateRBTForm(RBT);
  return (
    <Dialog size="fullscreen">
      <DialogHeader>
        <Trans message="Edit “:name“ RBT" values={{name: RBT.name}} />
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
          <Trans message="Update" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
