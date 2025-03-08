import React, {Fragment} from 'react';
import {ChannelContentProps} from '@app/web-player/channels/channel-content';
import {RBT} from '@app/web-player/RBT/RBT';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {RBTList} from '@app/web-player/RBT/RBT-list/RBT-list';
import {usePaginatedChannelContent} from '@common/channels/requests/use-paginated-channel-content';
import {ChannelContentItem} from '@common/channels/channel';

export function ChannelRBTList(
  props: ChannelContentProps<ChannelContentItem<RBT>>,
) {
  return (
    <Fragment>
      <ChannelHeading {...props} />
      {props.isNested ? (
        <RBTList RBT={props.channel.content?.data} />
      ) : (
        <PaginatedList {...props} />
      )}
    </Fragment>
  );
}

function PaginatedList({channel}: ChannelContentProps<RBT>) {
  const query = usePaginatedChannelContent<ChannelContentItem<RBT>>(channel);
  return <RBTList query={query} />;
}
