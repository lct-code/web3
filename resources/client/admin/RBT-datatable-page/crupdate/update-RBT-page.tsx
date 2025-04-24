import React from 'react';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {Trans} from '@common/i18n/trans';
import {RBTForm} from '@app/admin/RBT-datatable-page/RBT-form/RBT-form';
import {useRBT} from '@app/web-player/RBT/requests/use-RBT';
import {RBT} from '@app/web-player/RBT/RBT';
import {useUpdateRBTForm} from '@app/admin/RBT-datatable-page/crupdate/use-update-RBT-form';
import {useNavigate} from '@common/utils/hooks/use-navigate';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {PageStatus} from '@common/http/page-status';
import {Navigate, useLocation} from 'react-router-dom';
import {getRBTLink} from '@app/web-player/RBT/RBT-link';
import {useRBTPermissions} from '@app/web-player/RBT/hooks/use-RBT-permissions';

interface Props {
  wrapInContainer?: boolean;
}
export function UpdateRBTPage({wrapInContainer}: Props) {
  const query = useRBT({loader: 'editRBTPage'});
  if (query.data) {
    return (
      <PageContent RBT={query.data.RBT} wrapInContainer={wrapInContainer} />
    );
  }
  return (
    <PageStatus
      query={query}
      loaderClassName="absolute inset-0 m-auto"
      loaderIsScreen={false}
    />
  );
}

interface PageContentProps {
  RBT: RBT;
  wrapInContainer?: boolean;
}
function PageContent({RBT, wrapInContainer}: PageContentProps) {
  const {canEdit} = useRBTPermissions([RBT]);
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const {form, updateRBT} = useUpdateRBTForm(RBT, {
    onRBTUpdated: response => {
      if (pathname.includes('admin')) {
        navigate('/admin/RBT');
      } else {
        navigate(getRBTLink(response.RBT));
      }
    },
  });

  if (!canEdit) {
    return <Navigate to="/" replace />;
  }

  return (
    <CrupdateResourceLayout
      form={form}
      onSubmit={values => {
        updateRBT.mutate(values);
      }}
      title={<Trans message="Edit “:name“ RBT" values={{name: RBT.name}} />}
      isLoading={updateRBT.isPending}
      disableSaveWhenNotDirty
      wrapInContainer={wrapInContainer}
    >
      <FileUploadProvider>
        <RBTForm showExternalIdFields />
      </FileUploadProvider>
    </CrupdateResourceLayout>
  );
}
