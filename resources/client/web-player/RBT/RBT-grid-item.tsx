import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {PlayableGridItem} from '@app/web-player/playable-item/playable-grid-item';
import {RBT} from '@app/web-player/RBT/RBT';
import {RBTImage} from '@app/web-player/RBT/RBT-image/RBT-image';
import {getRBTLink, RBTLink} from '@app/web-player/RBT/RBT-link';
import {RBTContextDialog} from '@app/web-player/RBT/context-dialog/RBT-context-dialog';
import {LikeIconButton} from '@app/web-player/library/like-icon-button';

interface RBTGridItemProps {
  RBT: RBT;
  newQueue?: RBT[];
}
export function RBTGridItem({RBT, newQueue}: RBTGridItemProps) {
  return (
    <PlayableGridItem
      image={<RBTImage RBT={RBT} />}
      title={<RBTLink RBT={RBT} />}
      subtitle={<ArtistLinks artists={RBT.artists} />}
      link={getRBTLink(RBT)}
      likeButton={<LikeIconButton likeable={RBT} />}
      model={RBT}
      newQueue={newQueue}
      contextDialog={<RBTContextDialog RBT={[RBT]} />}
    />
  );
}
