import {RBT} from '@app/web-player/RBT/RBT';
import {MediaItem} from '@common/player/media-item';
import {getRBTImageSrc} from '@app/web-player/RBT/RBT-image/RBT-image';
import {Album} from '@app/web-player/albums/album';
import {guessPlayerProvider} from '@common/player/utils/guess-player-provider';

export function RBTToMediaItem(
  RBT: RBT,
  queueGroupId?: string | number
): MediaItem<RBT> {
  const provider: MediaItem['provider'] = RBT.src
    ? guessPlayerProvider(RBT.src)
    : 'youtube';

  if (!RBT.src || provider === 'youtube') {
    return {
      id: RBT.id,
      provider: 'youtube',
      meta: RBT,
      src: RBT.src ? RBT.src : 'resolve',
      groupId: queueGroupId,
    };
  }

  return {
    id: RBT.id,
    src: RBT.src,
    provider,
    meta: RBT,
    poster: getRBTImageSrc(RBT),
    groupId: queueGroupId,
  };
}

export function RBTToMediaItems(
  RBT: RBT[],
  queueGroupId?: string,
  album?: Album
) {
  return RBT.map(RBT => {
    if (album && !RBT.album) {
      RBT = {
        ...RBT,
        album: {...album, RBT: undefined},
      };
    }
    return RBTToMediaItem(RBT);
  });
}
