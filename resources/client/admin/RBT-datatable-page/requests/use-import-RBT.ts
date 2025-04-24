import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {useTrans} from '@common/i18n/use-trans';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {toast} from '@common/ui/toast/toast';
import {message} from '@common/i18n/message';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {showHttpErrorToast} from '@common/utils/http/show-http-error-toast';
import {RBT, RBT_MODEL} from '@app/web-player/RBT/RBT';

interface Response extends BackendResponse {
  RBT: RBT;
}

export interface ImportRBTPayload {
  spotifyId: string;
  importLyrics: boolean;
}

export function useImportRBT() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (props: ImportRBTPayload) => importRBT(props),
    onSuccess: () => {
      toast(trans(message('RBT imported')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('RBT'),
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function importRBT(payload: ImportRBTPayload): Promise<Response> {
  return apiClient
    .post('import-media/single-item', {
      modelType: RBT_MODEL,
      spotifyId: payload.spotifyId,
      importLyrics: payload.importLyrics,
    })
    .then(r => r.data);
}
