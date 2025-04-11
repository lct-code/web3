import {ColumnConfig} from '@common/datatable/column-config';
import {Trans} from '@common/i18n/trans';
import {FormattedDate} from '@common/i18n/formatted-date';
import {Link} from 'react-router-dom';
import {IconButton} from '@common/ui/buttons/icon-button';
import {EditIcon} from '@common/icons/material/Edit';
import React from 'react';
import {RBT} from '@app/web-player/RBT/RBT';
import {RBTImage} from '@app/web-player/RBT/RBT-image/RBT-image';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {FormattedDuration} from '@common/i18n/formatted-duration';
import {FormattedNumber} from '@common/i18n/formatted-number';
import {RBTLink} from '@app/web-player/RBT/RBT-link';
import {ArtistLink} from '@app/web-player/artists/artist-link';
import {DialogTrigger} from '@common/ui/overlays/dialog/dialog-trigger';
import {UpdateLyricDialog} from '@app/admin/lyrics-datatable-page/update-lyric-dialog';
import {CreateLyricDialog} from '@app/admin/lyrics-datatable-page/create-lyric-dialog';
import {ClosedCaptionIcon} from '@common/icons/material/ClosedCaption';
import {BarChartIcon} from '@common/icons/material/BarChart';

export const RBTDatatableColumns: ColumnConfig<RBT>[] = [
  {
    key: 'name',
    allowsSorting: true,
    header: () => <Trans message="RBT" />,
    width: 'flex-3 min-w-200',
    visibleInMode: 'all',
    body: RBT => (
      <div className="flex items-center gap-12">
        <RBTImage
          RBT={RBT}
          className="flex-shrink-0"
          size="w-34 h-34 rounded"
        />
        <RBTLink RBT={RBT} target="_blank" />
      </div>
    ),
  },
  {
    key: 'artist',
    allowsSorting: false,
    header: () => <Trans message="Artist" />,
    width: 'flex-2',
    body: RBT => {
      if (!RBT.artists?.[0]) return null;
      return (
        <div className="flex items-center gap-12">
          <SmallArtistImage
            artist={RBT.artists[0]}
            className="flex-shrink-0 rounded"
            size="w-34 h-34"
          />
          <ArtistLink artist={RBT.artists[0]} />
        </div>
      );
    },
  },
  {
    key: 'duration',
    minWidth: 'min-w-76',
    allowsSorting: true,
    header: () => <Trans message="Duration" />,
    body: RBT =>
      RBT.duration ? <FormattedDuration ms={RBT.duration} /> : null,
  },
  {
    key: 'plays',
    allowsSorting: true,
    minWidth: 'min-w-70',
    header: () => <Trans message="Plays" />,
    body: RBT =>
      RBT.plays ? <FormattedNumber value={RBT.plays} /> : null,
  },
  {
    key: 'updated_at',
    allowsSorting: true,
    width: 'w-100',
    header: () => <Trans message="Last updated" />,
    body: RBT =>
      RBT.updated_at ? <FormattedDate date={RBT.updated_at} /> : '',
  },
  // {
  //   key: 'actions',
  //   header: () => <Trans message="Actions" />,
  //   hideHeader: true,
  //   align: 'end',
  //   visibleInMode: 'all',
  //   width: 'w-128 flex-shrink-0',
  //   body: RBT => (
  //     <div className="text-muted">
  //       {/* <IconButton size="md" elementType={Link} to={`${RBT.id}/insights`}>
  //         <BarChartIcon />
  //       </IconButton>
  //       <DialogTrigger type="modal">
  //         <IconButton size="md">
  //           <ClosedCaptionIcon />
  //         </IconButton>
  //         {RBT.lyric ? (
  //           <UpdateLyricDialog lyric={RBT.lyric} />
  //         ) : (
  //           <CreateLyricDialog RBTId={RBT.id} />
  //         )}
  //       </DialogTrigger>
  //       <IconButton size="md" elementType={Link} to={`${RBT.id}/edit`}>
  //         <EditIcon />
  //       </IconButton> */}
  //     </div>
  //   ),
  // },
];
