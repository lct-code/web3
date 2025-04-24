import {useMutation} from '@tanstack/react-query';
import {useTrans} from '@common/i18n/use-trans';
import {toast} from '@common/ui/toast/toast';
import {message} from '@common/i18n/message';
import {apiClient, queryClient} from '@common/http/query-client';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {UseFormReturn} from 'react-hook-form';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {RBT} from '@app/web-player/RBT/RBT';
import {
  CreateRBTPayload,
  prepareRBTPayload,
} from '@app/admin/RBT-datatable-page/requests/use-create-RBT';

export interface UpdateRBTResponse extends BackendResponse {
  RBT: RBT;
}

export interface UpdateRBTPayload extends CreateRBTPayload {
  id: number;
}

const Endpoint = (id: number) => `RBT/${id}`;

interface Options {
  onSuccess?: (response: UpdateRBTResponse) => void;
}

export function useUpdateRBT(
  form: UseFormReturn<UpdateRBTPayload>,
  options: Options = {},
) {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (payload: UpdateRBTPayload) => updateChannel(payload),
    onSuccess: response => {
      toast(trans(message('RBT updated')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('RBT'),
      });
      options.onSuccess?.(response);
    },
    onError: err => onFormQueryError(err, form),
  });
}

function updateChannel({
  id,
  ...payload
}: UpdateRBTPayload): Promise<UpdateRBTResponse> {
  return apiClient
    .put(Endpoint(id), prepareRBTPayload(payload as CreateRBTPayload))
    .then(r => r.data);
}
