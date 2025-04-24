import {BackendResponse} from '@common/http/backend-response/backend-response';
import {Playlist} from '@app/web-player/playlists/playlist';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@common/ui/toast/toast';
import {message} from '@common/i18n/message';
import {apiClient, queryClient} from '@common/http/query-client';
import {RBT} from '@app/web-player/RBTs/RBT';
import {showHttpErrorToast} from '@common/utils/http/show-http-error-toast';

interface Response extends BackendResponse {
  playlist: Playlist;
}

interface Payload {
  playlistId: number;
  RBTs: RBT[];
}

export function useRemoveRBTsFromPlaylist() {
  return useMutation({
    mutationFn: (payload: Payload) => removeRBTs(payload),
    onSuccess: (response, {RBTs}) => {
      toast(
        message('Removed [one 1 RBT|other :count RBTs] from playlist', {
          values: {count: RBTs.length},
        }),
      );
      queryClient.invalidateQueries({
        queryKey: ['playlists', response.playlist.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['RBTs', 'playlist', response.playlist.id],
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function removeRBTs(payload: Payload): Promise<Response> {
  const backendPayload = {
    ids: payload.RBTs.map(RBT => RBT.id),
  };
  return apiClient
    .post(`playlists/${payload.playlistId}/RBTs/remove`, backendPayload)
    .then(r => r.data);
}
