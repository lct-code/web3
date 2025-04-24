import React, {Fragment, useContext} from 'react';
import {RBT} from '@app/web-player/RBT/RBT';
import clsx from 'clsx';
import {useIsMobileMediaQuery} from '@common/utils/hooks/is-mobile-media-query';
import {DialogTrigger} from '@common/ui/overlays/dialog/dialog-trigger';
import {IconButton} from '@common/ui/buttons/icon-button';
import {MoreHorizIcon} from '@common/icons/material/MoreHoriz';
import {RBTContextDialog} from '@app/web-player/RBT/context-dialog/RBT-context-dialog';
import {LikeIconButton} from '@app/web-player/library/like-icon-button';
import {MoreVertIcon} from '@common/icons/material/MoreVert';
import {TableContext} from '@common/ui/tables/table-context';
import {RemoveFromPlaylistMenuItem} from '@app/web-player/playlists/playlist-page/playlist-RBT-context-dialog';

interface Props {
  RBT: RBT;
  isHovered: boolean;
}
export function RBTOptionsColumn({RBT, isHovered}: Props) {
  const isMobile = useIsMobileMediaQuery();
  const {meta} = useContext(TableContext);
  return (
    <Fragment>
      <DialogTrigger type="popover" mobileType="tray">
        <IconButton
          size={isMobile ? 'sm' : 'md'}
          className={clsx(
            isMobile ? 'text-muted' : 'mr-8',
            !isMobile && !isHovered && 'invisible',
          )}
        >
          {isMobile ? <MoreVertIcon /> : <MoreHorizIcon />}
        </IconButton>
        <RBTContextDialog RBT={[RBT]}>
          {RBT =>
            meta.playlist ? (
              <RemoveFromPlaylistMenuItem
                playlist={meta.playlist}
                RBT={RBT}
              />
            ) : null
          }
        </RBTContextDialog>
      </DialogTrigger>
      {!isMobile && <LikeIconButton size="xs" likeable={RBT} />}
    </Fragment>
  );
}
