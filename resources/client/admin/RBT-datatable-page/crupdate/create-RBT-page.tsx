import React from 'react';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {Trans} from '@common/i18n/trans';
import {RBTForm} from '@app/admin/RBT-datatable-page/RBT-form/RBT-form';
import {useCreateRBTForm} from '@app/admin/RBT-datatable-page/crupdate/use-create-RBT-form';
import {useNavigate} from '@common/utils/hooks/use-navigate';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {useLocation} from 'react-router-dom';
import {getRBTLink} from '@app/web-player/RBT/RBT-link';

interface Props {
  wrapInContainer?: boolean;
}
export function CreateRBTPage({wrapInContainer}: Props) {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const {form, createRBT} = useCreateRBTForm({
    onRBTCreated: response => {
      if (pathname.includes('admin')) {
        navigate(`/admin/RBT/${response.RBT.id}/edit`);
      } else {
        navigate(getRBTLink(response.RBT));
      }
    },
  });
  return (
    <CrupdateResourceLayout
      form={form}
      onSubmit={values => {
        createRBT.mutate(values);
      }}
      title={<Trans message="Add new RBT" />}
      isLoading={createRBT.isPending}
      disableSaveWhenNotDirty
      wrapInContainer={wrapInContainer}
    >
      <FileUploadProvider>
        <RBTForm showExternalIdFields />
      </FileUploadProvider>
    </CrupdateResourceLayout>
  );
}
