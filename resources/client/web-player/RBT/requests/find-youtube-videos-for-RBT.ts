import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {RBT} from '@app/web-player/RBT/RBT';
import {CancelTokenSource} from 'axios';

interface Response extends BackendResponse {
  results: {title: string; id: string}[];
}

const endpoint = (RBT: RBT) => {
  const artistName =
    RBT.artists?.[0]?.name || RBT.album?.artists?.[0]?.name;
  return `search/audio/${RBT.id}/${doubleEncode(artistName!)}/${doubleEncode(
    RBT.name
  )}`;
};

export let isSearchingForYoutubeVideo = false;

export async function findYoutubeVideosForRBT(
  RBT: RBT,
  cancelToken?: CancelTokenSource
): Promise<Response['results']> {
  const query = {
    queryKey: [endpoint(RBT)],
    queryFn: async () => findMatch(RBT, cancelToken),
    staleTime: Infinity,
  };

  const response =
    queryClient.getQueryData<Response>(query.queryKey) ??
    (await queryClient.fetchQuery(query));

  isSearchingForYoutubeVideo = false;

  return response?.results || [];
}

function findMatch(
  RBT: RBT,
  cancelToken?: CancelTokenSource
): Promise<Response> {
  isSearchingForYoutubeVideo = true;
  return apiClient
    .get(endpoint(RBT), {cancelToken: cancelToken?.token})
    .then(response => response.data);
}

function doubleEncode(value: string) {
  return encodeURIComponent(encodeURIComponent(value));
}
