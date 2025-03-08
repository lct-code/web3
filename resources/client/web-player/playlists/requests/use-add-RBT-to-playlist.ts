import {BackendResponse} from '@common/http/backend-response/backend-response';
import {Playlist} from '@app/web-player/playlists/playlist';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@common/ui/toast/toast';
import {message} from '@common/i18n/message';
import {apiClient, queryClient} from '@common/http/query-client';
import {RBT} from '@app/web-player/RBT/RBT';
import {showHttpErrorToast} from '@common/utils/http/show-http-error-toast';

interface Response extends BackendResponse {
  playlist: Playlist;
}

interface Payload {
  playlistId: number;
  RBT: RBT[];
}

export function useAddRBTToPlaylist() {
  return useMutation({
    mutationFn: (payload: Payload) => addRBT(payload),
    onSuccess: (response, {RBT}) => {
      toast(
        message('Added [one 1 RBT|other :count RBT] to playlist', {
          values: {count: RBT.length},
        }),
      );
      queryClient.invalidateQueries({
        queryKey: ['playlists', response.playlist.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['RBT', 'playlist', response.playlist.id],
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function addRBT(payload: Payload): Promise<Response> {
  const backendPayload = {
    ids: payload.RBT.map(RBT => RBT.id),
  };
  return apiClient
    .post(`playlists/${payload.playlistId}/RBT/add`, backendPayload)
    .then(r => r.data);
}
