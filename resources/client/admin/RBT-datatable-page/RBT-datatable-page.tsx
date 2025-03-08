import React, {Fragment} from 'react';
import {DataTablePage} from '@common/datatable/page/data-table-page';
import {Trans} from '@common/i18n/trans';
import {DeleteSelectedItemsAction} from '@common/datatable/page/delete-selected-items-action';
import {DataTableEmptyStateMessage} from '@common/datatable/page/data-table-emty-state-message';
import marketing from './music.svg';
import {DataTableAddItemButton} from '@common/datatable/data-table-add-item-button';
import {Link} from 'react-router-dom';
import {RBTDatatableColumns} from '@app/admin/RBT-datatable-page/RBT-datatable-columns';
import {RBTDatatableFilters} from '@app/admin/RBT-datatable-page/RBT-datatable-filters';
import {useSettings} from '@common/core/settings/use-settings';
import {useNavigate} from '@common/utils/hooks/use-navigate';
import {DialogTrigger} from '@common/ui/overlays/dialog/dialog-trigger';
import {Tooltip} from '@common/ui/tooltip/tooltip';
import {IconButton} from '@common/ui/buttons/icon-button';
import {ImportRBTDialog} from '@app/admin/RBT-datatable-page/import-RBT-dialog';
import {PublishIcon} from '@common/icons/material/Publish';

export function RBTDatatablePage() {
  return (
    <DataTablePage
      endpoint="RBT"
      title={<Trans message="RBT" />}
      filters={RBTDatatableFilters}
      columns={RBTDatatableColumns}
      queryParams={{
        with: 'artists,lyric',
      }}
      actions={<Actions />}
      selectedActions={<DeleteSelectedItemsAction />}
      emptyStateMessage={
        <DataTableEmptyStateMessage
          image={marketing}
          title={<Trans message="No RBT have been created yet" />}
          filteringTitle={<Trans message="No matching RBT" />}
        />
      }
    />
  );
}

function Actions() {

  return (
    <Fragment>
      <DataTableAddItemButton elementType={Link} to="new">
        <Trans message="Add new RBT" />
      </DataTableAddItemButton>
    </Fragment>
  );
}
