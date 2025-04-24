import {useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {RBT} from '@app/web-player/RBT/RBT';
import {Lyric} from '@app/web-player/RBT/lyrics/lyric';

interface Response extends BackendResponse {
  lyric?: Lyric;
}

export function useLyrics(RBT: RBT) {
  return useQuery({
    queryKey: ['lyrics', RBT.id],
    queryFn: () => fetchLyrics(RBT.id)
  });
}

function fetchLyrics(RBTId: number) {
  return apiClient
    .get<Response>(`RBT/${RBTId}/lyrics`)
    .then(response => response.data);
}
