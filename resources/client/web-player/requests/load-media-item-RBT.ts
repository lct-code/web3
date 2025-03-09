import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {RBT} from '@app/web-player/RBT/RBT';

interface Response extends BackendResponse {
  RBT: RBT[];
}

export async function loadMediaItemRBT(
  queueId: string,
  lastRBT?: RBT
): Promise<Response['RBT']> {
  const query = {
    queryKey: ['player/RBT', {queueId, RBTId: lastRBT?.id}],
    queryFn: async () => loadRBT(queueId, lastRBT),
    staleTime: Infinity,
  };

  try {
    const response =
      queryClient.getQueryData<Response>(query.queryKey) ??
      (await queryClient.fetchQuery(query));
    return response?.RBT || [];
  } catch (e) {
    return [];
  }
}

function loadRBT(queueId: string, lastRBT?: RBT): Promise<Response> {
  return apiClient
    .post('player/RBT', {queueId, lastRBT})
    .then(response => response.data);
}
