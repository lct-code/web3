import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';
import {apiClient, queryClient} from '@common/http/query-client';
import {toast} from '@common/ui/toast/toast';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {useTrans} from '@common/i18n/use-trans';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {message} from '@common/i18n/message';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {RBT} from '@app/web-player/RBT/RBT';
import {NormalizedModel} from '@common/datatable/filters/normalized-model';
import {RBTUploadPayload} from '@app/web-player/backstage/upload-page/use-RBT-uploader';

const endpoint = 'RBT';

export interface CreateRBTResponse extends BackendResponse {
  RBT: RBT;
}

export interface CreateRBTPayload
  extends Omit<
    RBT,
    'genres' | 'artists' | 'tags' | 'id' | 'model_type' | 'album' | 'lyric'
  > {
  album_id?: number;
  artists?: NormalizedModel[];
  waveData?: number[][];
  genres?: NormalizedModel[] | string[];
  tags?: NormalizedModel[];
  lyric?: string;
}

interface Options {
  onSuccess?: (response: CreateRBTResponse) => void;
}

export function useCreateRBT(
  form: UseFormReturn<CreateRBTPayload> | UseFormReturn<RBTUploadPayload>,
  {onSuccess}: Options = {},
) {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (payload: CreateRBTPayload) => createRBT(payload),
    onSuccess: response => {
      toast(trans(message('RBT created')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint),
      });
      onSuccess?.(response);
    },
    onError: err => onFormQueryError(err, form),
  });
}

function createRBT(payload: CreateRBTPayload) {
  return apiClient
    .post<CreateRBTResponse>(endpoint, prepareRBTPayload(payload))
    .then(r => r.data);
}

export function prepareRBTPayload(payload: CreateRBTPayload) {
  if (!payload.artists?.length) {
    console.warn('No artists provided in RBT payload');
  }
  return {
    ...payload,
    album_id: payload.album_id ? payload.album_id : null,
    artists: payload.artists?.map(artist => artist.id) || [],
  };
}
