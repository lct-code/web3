import {RBT} from '@app/web-player/RBT/RBT';
import {Table, TableProps} from '@common/ui/tables/table';
import {ColumnConfig} from '@common/datatable/column-config';
import {Trans} from '@common/i18n/trans';
import React, {useMemo} from 'react';
import {AlbumLink} from '@app/web-player/albums/album-link';
import {ScheduleIcon} from '@common/icons/material/Schedule';
import {FormattedDuration} from '@common/i18n/formatted-duration';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {TogglePlaybackColumn} from '@app/web-player/RBT/RBT-table/toggle-playback-column';
import {RBTNameColumn} from '@app/web-player/RBT/RBT-table/RBT-name-column';
import {RBTTableMeta} from '@app/web-player/RBT/RBT-table/use-RBT-table-meta';
import {Skeleton} from '@common/ui/skeleton/skeleton';
import {NameWithAvatarPlaceholder} from '@common/datatable/column-templates/name-with-avatar';
import {DialogTrigger} from '@common/ui/overlays/dialog/dialog-trigger';
import {RowElementProps} from '@common/ui/tables/table-row';
import {TableRBTContextDialog} from '@app/web-player/RBT/context-dialog/table-RBT-context-dialog';
import {TrendingUpIcon} from '@common/icons/material/TrendingUp';
import {FormattedRelativeTime} from '@common/i18n/formatted-relative-time';
import {RBTToMediaItem} from '@app/web-player/RBT/utils/RBT-to-media-item';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {RBTOptionsColumn} from '@app/web-player/RBT/RBT-table/RBT-options-column';
import {TableDataItem} from '@common/ui/tables/types/table-data-item';
import {useIsMobileDevice} from '@common/utils/hooks/is-mobile-device';
import {Playlist} from '@app/web-player/playlists/playlist';

const columnConfig: ColumnConfig<RBT>[] = [
  {
    key: 'index',
    header: () => <span>#</span>,
    align: 'center',
    width: 'w-24 flex-shrink-0',
    body: (RBT, row) => {
      if (row.isPlaceholder) {
        return <Skeleton size="w-20 h-20" variant="rect" />;
      }
      return (
        <TogglePlaybackColumn
          RBT={RBT}
          rowIndex={row.index}
          isHovered={row.isHovered}
        />
      );
    },
  },
  {
    key: 'name',
    allowsSorting: true,
    width: 'flex-3 min-w-224',
    visibleInMode: 'all',
    header: () => <Trans message="Title" />,
    body: (RBT, row) => {
      if (row.isPlaceholder) {
        return <NameWithAvatarPlaceholder showDescription={false} />;
      }
      return <RBTNameColumn RBT={RBT} />;
    },
  },
  {
    key: 'artist',
    header: () => <Trans message="Artist" />,
    width: 'flex-2',
    body: (RBT, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="max-w-4/5 leading-3" />;
      }
      return <ArtistLinks artists={RBT.artists} />;
    },
  },
  {
    key: 'album_name',
    allowsSorting: true,
    width: 'flex-2',
    header: () => <Trans message="Album" />,
    body: (RBT, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="max-w-4/5 leading-3" />;
      }
      return RBT.album ? <AlbumLink album={RBT.album} /> : null;
    },
  },
  {
    key: 'added_at',
    sortingKey: 'likes.created_at',
    allowsSorting: true,
    maxWidth: 'max-w-112',
    header: () => <Trans message="Date added" />,
    body: (RBT, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="max-w-4/5 leading-3" />;
      }
      return <FormattedRelativeTime date={RBT.added_at} />;
    },
  },
  {
    key: 'options',
    align: 'end',
    width: 'w-36 md:w-84',
    header: () => <Trans message="Options" />,
    hideHeader: true,
    visibleInMode: 'all',
    body: (RBT, row) => {
      if (row.isPlaceholder) {
        return (
          <div className="flex justify-end">
            <Skeleton size="w-20 h-20" variant="rect" />
          </div>
        );
      }
      return <RBTOptionsColumn RBT={RBT} isHovered={row.isHovered} />;
    },
  },
  {
    key: 'duration',
    allowsSorting: true,
    className: 'text-muted',
    maxWidth: 'max-w-48',
    align: 'end',
    header: () => <ScheduleIcon />,
    body: (RBT, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="leading-3" />;
      }
      return RBT.duration ? <FormattedDuration ms={RBT.duration} /> : null;
    },
  },
  {
    key: 'popularity',
    allowsSorting: true,
    className: 'text-muted',
    maxWidth: 'max-w-54',
    header: () => <TrendingUpIcon />,
    body: (RBT, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="leading-3" />;
      }
      return (
        <div className="relative h-6 w-full bg-chip">
          <div
            style={{width: `${RBT.popularity || 50}%`}}
            className="absolute left-0 top-0 h-full w-0 bg-black/30 dark:bg-white/30"
          />
        </div>
      );
    },
  },
];

export interface RBTTableProps {
  RBT: RBT[] | TableDataItem[]; // might be passing in placeholder items for skeletons
  hideArtist?: boolean;
  hideAlbum?: boolean;
  hideRBTImage?: boolean;
  hidePopularity?: boolean;
  hideAddedAtColumn?: boolean;
  hideHeaderRow?: boolean;
  queueGroupId?: string | number;
  playlist?: Playlist;
  renderRowAs?: TableProps<RBT>['renderRowAs'];
  sortDescriptor?: TableProps<RBT>['sortDescriptor'];
  onSortChange?: TableProps<RBT>['onSortChange'];
  enableSorting?: TableProps<RBT>['enableSorting'];
  tableBody?: TableProps<RBT>['tableBody'];
  className?: string;
}
export function RBTTable({
  RBT,
  hideArtist = false,
  hideAlbum = false,
  hideHeaderRow = false,
  hideRBTImage = false,
  hidePopularity = true,
  hideAddedAtColumn = true,
  queueGroupId,
  renderRowAs,
  playlist,
  ...tableProps
}: RBTTableProps) {
  const player = usePlayerActions();
  const isMobile = useIsMobileDevice();
  hideHeaderRow = hideHeaderRow || isMobile;

  const filteredColumns = useMemo(() => {
    return columnConfig.filter(col => {
      if (col.key === 'artist' && hideArtist) {
        return false;
      }
      if (col.key === 'album_name' && hideAlbum) {
        return false;
      }
      if (col.key === 'popularity' && hidePopularity) {
        return false;
      }
      if (col.key === 'added_at' && hideAddedAtColumn) {
        return false;
      }
      return true;
    });
  }, [hideArtist, hideAlbum, hidePopularity, hideAddedAtColumn]);

  const meta: RBTTableMeta = useMemo(() => {
    return {queueGroupId: queueGroupId, hideRBTImage, playlist};
  }, [queueGroupId, hideRBTImage, playlist]);

  return (
    <Table
      closeOnInteractOutside
      hideHeaderRow={hideHeaderRow}
      selectionStyle="highlight"
      selectRowOnContextMenu
      renderRowAs={renderRowAs || RBTTableRowWithContextMenu}
      columns={filteredColumns}
      data={RBT as RBT[]}
      meta={meta}
      hideBorder={isMobile}
      onAction={(RBT, index) => {
        const newQueue = RBT.map(d =>
          RBTToMediaItem(d as RBT, queueGroupId),
        );
        player.overrideQueueAndPlay(newQueue, index);
      }}
      {...tableProps}
    />
  );
}

function RBTTableRowWithContextMenu({
  item,
  children,
  ...domProps
}: RowElementProps<RBT>) {
  const row = <div {...domProps}>{children}</div>;
  if (item.isPlaceholder) {
    return row;
  }
  return (
    <DialogTrigger
      type="popover"
      mobileType="tray"
      triggerOnContextMenu
      placement="bottom-start"
    >
      {row}
      <TableRBTContextDialog />
    </DialogTrigger>
  );
}
