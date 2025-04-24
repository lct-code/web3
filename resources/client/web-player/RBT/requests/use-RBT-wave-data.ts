import {useQuery} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {Comment} from '@common/comments/comment';

interface WaveDataResponse extends BackendResponse {
  waveData: number[][];
  comments: Comment[];
}

function queryKey(RBTId: number | string) {
  return ['RBT', +RBTId, 'wave-data'];
}

export function invalidateWaveData(RBTId: number | string) {
  queryClient.invalidateQueries({queryKey: queryKey(RBTId)});
}

export function useRBTWaveData(
  RBTId: number | string,
  {enabled}: {enabled?: boolean} = {},
) {
  return useQuery({
    queryKey: queryKey(RBTId),
    queryFn: () => fetchWaveData(RBTId),
    enabled,
  });
}

function fetchWaveData(RBTId: number | string) {
  return apiClient
    .get<WaveDataResponse>(`RBT/${RBTId}/wave`)
    .then(response => response.data);
}
