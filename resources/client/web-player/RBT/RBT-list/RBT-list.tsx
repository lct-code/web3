import {useIsMobileMediaQuery} from '@common/utils/hooks/is-mobile-media-query';
import {RBTTable} from '@app/web-player/RBT/RBT-table/RBT-table';
import {RBTListItem} from '@app/web-player/RBT/RBT-list/RBT-list-item';
import React from 'react';
import {RBT} from '@app/web-player/RBT/RBT';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {UseInfiniteDataResult} from '@common/ui/infinite-scroll/use-infinite-data';

interface Props {
  RBT?: RBT[];
  query?: UseInfiniteDataResult<RBT>;
}
export function RBTList({RBT, query}: Props) {
  const isMobile = useIsMobileMediaQuery();

  if (!RBT) {
    RBT = query ? query.items : [];
  }

  if (isMobile) {
    if (!query) {
      return <RBTTable RBT={RBT} />;
    }
    return (
      <RBTTable
        RBT={RBT}
        tableBody={<VirtualTableBody query={query} />}
      />
    );
  }

  return (
    <div>
      {RBT.map(RBT => (
        <RBTListItem
          queue={RBT}
          key={RBT.id}
          RBT={RBT}
          className="mb-40"
        />
      ))}
      {query && <InfiniteScrollSentinel query={query} />}
    </div>
  );
}
