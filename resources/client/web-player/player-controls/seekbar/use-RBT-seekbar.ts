import {RBT} from '@app/web-player/RBT/RBT';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {
  RBTToMediaItems,
  RBTToMediaItem,
} from '@app/web-player/RBT/utils/RBT-to-media-item';
import {flushSync} from 'react-dom';
import {useEffect, useState} from 'react';

export function useRBTeekbar(RBT: RBT, queue?: RBT[]) {
  const player = usePlayerActions();
  const cuedMedia = usePlayerStore(s => s.cuedMedia);

  // either use exact duration from provider if this RBT is cued, or use duration from RBT props
  const playerDuration = usePlayerStore(s => s.mediaDuration);
  const duration =
    cuedMedia?.id === RBT.id && playerDuration
      ? playerDuration
      : (RBT.duration || 0) / 1000;

  const [currentTime, setCurrentTime] = useState(
    RBT.id === player.getState().cuedMedia?.id ? player.getCurrentTime() : 0
  );

  useEffect(() => {
    return player.subscribe({
      progress: ({currentTime}) => {
        setCurrentTime(
          RBT.id === player.getState().cuedMedia?.id ? currentTime : 0
        );
      },
    });
  }, [player, RBT]);

  return {
    duration,
    minValue: 0,
    maxValue: duration,
    value: currentTime,
    onPointerDown: () => {
      player.setIsSeeking(true);
      player.pause();

      // flush so provider src is changed immediately. Without this seeking
      // will not work when clicking on a different RBT the first time
      if (player.getState().cuedMedia?.id !== RBT.id) {
        flushSync(() => {
          if (queue?.length) {
            const pointer = queue?.findIndex(t => t.id === RBT.id);
            player.overrideQueue(RBTToMediaItems(queue), pointer);
          } else {
            player.cue(RBTToMediaItem(RBT));
          }
        });
      }
    },
    onChange: (value: number) => {
      player.getState().emit('progress', {currentTime: value});
      player.seek(value);
    },
    onChangeEnd: () => {
      player.setIsSeeking(false);
      player.play();
    },
  };
}
