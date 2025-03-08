import {BackendResponse} from '@common/http/backend-response/backend-response';
import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {RBT} from '@app/web-player/RBT/RBT';
import {showHttpErrorToast} from '@common/utils/http/show-http-error-toast';
import {useParams} from 'react-router-dom';
import {moveMultipleItemsInArray} from '@common/utils/array/move-multiple-items-in-array';

interface Response extends BackendResponse {
  //
}

interface Payload {
  RBT: RBT[];
  oldIndexes: number | number[];
  newIndex: number;
}

export function useReorderPlaylistRBT() {
  const {playlistId} = useParams();
  return useMutation({
    mutationFn: (payload: Payload) => reorderRBT(playlistId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['RBT', 'playlist', +playlistId!],
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function reorderRBT(
  playlistId: number | string,
  {RBT, oldIndexes, newIndex}: Payload,
): Promise<Response> {
  const ids = RBT.map(t => t.id);
  moveMultipleItemsInArray(ids, oldIndexes, newIndex);
  return apiClient
    .post(`playlists/${playlistId}/RBT/order`, {ids})
    .then(r => r.data);
}
