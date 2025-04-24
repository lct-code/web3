import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {useIsRBTCued} from '@app/web-player/RBT/hooks/use-is-RBT-cued';

export function useIsRBTPlaying(
  RBTId: number,
  groupId?: string | number
): boolean {
  const isCued = useIsRBTCued(RBTId, groupId);
  const isPlaying = usePlayerStore(s => s.isPlaying);
  return isCued && isPlaying;
}
