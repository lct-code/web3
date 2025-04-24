import {useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';

export interface SyncedLyricResponse {
  is_synced: true;
  lines: {time: number; text: string}[];
  duration: number | null;
}

export interface PlainLyricResponse {
  is_synced: false;
  lines: {text: string}[];
}

export interface UseLyricsResponse extends BackendResponse {
  is_synced: true;
  lines: {time?: number; text: string}[];
  duration: number | null;
}

interface UseLyricsQueryParams {
  duration: number;
}

export function useLyrics(
  RBTId: number | string,
  queryParams: UseLyricsQueryParams,
) {
  return useQuery({
    queryKey: ['lyrics', RBTId],
    queryFn: () => fetchLyrics(RBTId, queryParams),
  });
}

function fetchLyrics(
  RBTId: number | string,
  queryParams: UseLyricsQueryParams,
) {
  return apiClient
    .get<UseLyricsResponse>(`RBT/${RBTId}/lyrics`, {params: queryParams})
    .then(response => response.data);
}
