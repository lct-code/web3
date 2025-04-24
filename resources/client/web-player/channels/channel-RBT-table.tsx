import React, {Fragment} from 'react';
import {ChannelContentProps} from '@app/web-player/channels/channel-content';
import {RBTTable} from '@app/web-player/RBT/RBT-table/RBT-table';
import {RBT} from '@app/web-player/RBT/RBT';
import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {usePaginatedChannelContent} from '@common/channels/requests/use-paginated-channel-content';
import {ChannelContentItem} from '@common/channels/channel';

export function ChannelRBTTable(
  props: ChannelContentProps<ChannelContentItem<RBT>>,
) {
  return (
    <Fragment>
      <ChannelHeading {...props} />
      {props.isNested ? (
        <SimpleTable {...props} />
      ) : (
        <PaginatedTable {...props} />
      )}
    </Fragment>
  );
}

function SimpleTable({channel}: ChannelContentProps<RBT>) {
  return (
    <RBTTable RBT={channel.content?.data || []} enableSorting={false} />
  );
}

function PaginatedTable({channel}: ChannelContentProps<RBT>) {
  const query = usePaginatedChannelContent<ChannelContentItem<RBT>>(channel);

  const totalItems =
    channel.content && 'total' in channel.content
      ? channel.content.total
      : undefined;

  return (
    <RBTTable
      enableSorting={false}
      RBT={query.items}
      tableBody={<VirtualTableBody query={query} totalItems={totalItems} />}
    />
  );
}
