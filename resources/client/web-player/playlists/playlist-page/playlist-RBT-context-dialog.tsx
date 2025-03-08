import {Playlist} from '@app/web-player/playlists/playlist';
import {Trans} from '@common/i18n/trans';
import {ContextMenuButton} from '@app/web-player/context-dialog/context-dialog-layout';
import {useRemoveRBTFromPlaylist} from '@app/web-player/playlists/requests/use-remove-RBT-from-playlist';
import {useDialogContext} from '@common/ui/overlays/dialog/dialog-context';
import {TableRBTContextDialog} from '@app/web-player/RBT/context-dialog/table-RBT-context-dialog';
import {useAuth} from '@common/auth/use-auth';
import {RBT} from '@app/web-player/RBT/RBT';

interface PlaylistRBTContextDialogProps {
  playlist: Playlist;
}
export function PlaylistRBTContextDialog({
  playlist,
  ...props
}: PlaylistRBTContextDialogProps) {
  return (
    <TableRBTContextDialog {...props}>
      {RBT => (
        <RemoveFromPlaylistMenuItem playlist={playlist} RBT={RBT} />
      )}
    </TableRBTContextDialog>
  );
}

interface RemoveFromPlaylistMenuItemProps {
  playlist: Playlist;
  RBT: RBT[];
}
export function RemoveFromPlaylistMenuItem({
  playlist,
  RBT,
}: RemoveFromPlaylistMenuItemProps) {
  const {user} = useAuth();
  const removeRBT = useRemoveRBTFromPlaylist();
  const {close: closeMenu} = useDialogContext();
  const canRemove = playlist.owner_id === user?.id || playlist.collaborative;

  if (!canRemove) {
    return null;
  }

  return (
    <ContextMenuButton
      onClick={() => {
        if (!removeRBT.isPending) {
          removeRBT.mutate({playlistId: playlist.id, RBT});
          closeMenu();
        }
      }}
    >
      <Trans message="Remove from this playlist" />
    </ContextMenuButton>
  );
}
