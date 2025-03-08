import React, {useMemo} from 'react';
import {playerStoreOptions} from '@app/web-player/state/player-store-options';
import {PlayerContext} from '@common/player/player-context';
import {RBTListItem} from '@app/web-player/RBT/RBT-list/RBT-list-item';
import {useRBT} from '@app/web-player/RBT/requests/use-RBT';
import {FullPageLoader} from '@common/ui/progress/full-page-loader';
import {RBT} from '@app/web-player/RBT/RBT';
import {RBTToMediaItem} from '@app/web-player/RBT/utils/RBT-to-media-item';
import {PlayerStoreOptions} from '@common/player/state/player-store-options';
import {PlayerOutlet} from '@common/player/ui/player-outlet';
import {PlayerPoster} from '@common/player/ui/controls/player-poster';

export function RBTEmbed() {
  const {data} = useRBT({loader: 'RBTPage'});
  return (
    <div className="h-[174px] rounded border bg-alt p-14">
      {!data?.RBT ? (
        <FullPageLoader screen={false} />
      ) : (
        <EmbedContent RBT={data.RBT} />
      )}
    </div>
  );
}

interface EmbedContentProps {
  RBT: RBT;
}
function EmbedContent({RBT}: EmbedContentProps) {
  const options: PlayerStoreOptions = useMemo(() => {
    const mediaItem = RBTToMediaItem(RBT);
    return {
      ...playerStoreOptions,
      initialData: {
        queue: [mediaItem],
        cuedMediaId: mediaItem.id,
        state: {
          repeat: false,
        },
      },
    };
  }, [RBT]);
  return (
    <PlayerContext id="web-player" options={options}>
      <div className="flex gap-24">
        <div className="relative h-144 w-144 flex-shrink-0 overflow-hidden rounded bg-black">
          <PlayerPoster className="absolute inset-0" />
          <PlayerOutlet className="h-full w-full" />
        </div>
        <RBTListItem
          RBT={RBT}
          hideArtwork
          hideActions
          linksInNewTab
          className="flex-auto"
        />
      </div>
    </PlayerContext>
  );
}
