import {RBT} from '@app/web-player/RBT/RBT';
import {useTrans} from '@common/i18n/use-trans';
import React, {useContext, useState} from 'react';
import {TableContext} from '@common/ui/tables/table-context';
import {RBTToMediaItem} from '@app/web-player/RBT/utils/RBT-to-media-item';
import {message} from '@common/i18n/message';
import {PauseIcon} from '@common/icons/material/Pause';
import {PlayArrowFilledIcon} from '@app/web-player/RBT/play-arrow-filled';
import clsx from 'clsx';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {useRBTTableMeta} from '@app/web-player/RBT/RBT-table/use-RBT-table-meta';
import {EqualizerImage} from '@app/web-player/RBT/equalizer-image/equalizer-image';
import {useIsRBTPlaying} from '@app/web-player/RBT/hooks/use-is-RBT-playing';
import {useIsRBTCued} from '@app/web-player/RBT/hooks/use-is-RBT-cued';

interface TogglePlaybackColumnProps {
  RBT: RBT;
  rowIndex: number;
  isHovered: boolean;
}
export function TogglePlaybackColumn({
  RBT,
  rowIndex,
  isHovered,
}: TogglePlaybackColumnProps) {
  const {queueGroupId} = useRBTTableMeta();
  const isPlaying = useIsRBTPlaying(RBT.id, queueGroupId);
  const isCued = useIsRBTCued(RBT.id, queueGroupId);

  return (
    <div className="w-24 h-24 text-center">
      {isHovered || isPlaying ? (
        <TogglePlaybackButton
          RBT={RBT}
          RBTIndex={rowIndex}
          isPlaying={isPlaying}
        />
      ) : (
        <span className={clsx(isCued ? 'text-primary' : 'text-muted')}>
          {rowIndex + 1}
        </span>
      )}
    </div>
  );
}

interface TogglePlaybackButtonProps {
  RBT: RBT;
  RBTIndex: number;
  isPlaying: boolean;
}
function TogglePlaybackButton({
  RBT,
  RBTIndex,
  isPlaying,
}: TogglePlaybackButtonProps) {
  const {trans} = useTrans();
  const player = usePlayerActions();
  const {data} = useContext(TableContext);
  const {queueGroupId} = useRBTTableMeta();
  const [isHover, setHover] = useState(false);

  if (isPlaying) {
    return (
      <button
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        aria-label={trans(message('Pause :name', {values: {name: RBT.name}}))}
        tabIndex={0}
        onClick={e => {
          e.stopPropagation();
          player.pause();
        }}
      >
        {isHover ? <PauseIcon /> : <EqualizerImage />}
      </button>
    );
  }

  return (
    <button
      aria-label={trans(message('Play :name', {values: {name: RBT.name}}))}
      tabIndex={0}
      onClick={async e => {
        e.stopPropagation();
        const newQueue = data.map(d =>
          RBTToMediaItem(d as RBT, queueGroupId)
        );
        player.overrideQueueAndPlay(newQueue, RBTIndex);
      }}
    >
      <PlayArrowFilledIcon />
    </button>
  );
}
